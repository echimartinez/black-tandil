import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/model/Order';
import User from '@/model/User';
import Expense from '@/model/Expense';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }

  await dbConnect();

  const [
    totalOrders,
    approvedOrders,
    totalUsers,
    recentOrders,
    expenses,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'approved' }),
    User.countDocuments(),
    Order.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5),
    Expense.find({ type: 'gasto_fijo' }),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total ?? 0;

  const monthlyExpenses = (expenses as any[]).reduce((acc: number, e: any) => {
    const perMonth = e.frequency === 'mensual' ? e.amount
      : e.frequency === 'trimestral' ? e.amount / 3
      : e.frequency === 'semestral' ? e.amount / 6
      : e.amount / 12;
    return acc + perMonth;
  }, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const salesByDay = await Order.aggregate([
    { $match: { status: 'approved', createdAt: { $gte: sevenDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ]);

  return new Response(JSON.stringify({
    totalOrders,
    approvedOrders,
    pendingOrders: totalOrders - approvedOrders,
    totalRevenue,
    totalUsers,
    recentOrders,
    salesByDay,
    monthlyExpenses,
  }), { status: 200 });
}
