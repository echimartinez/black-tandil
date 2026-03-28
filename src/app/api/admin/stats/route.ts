import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/model/Order';
import User from '@/model/User';

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
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'approved' }),
    User.countDocuments(),
    Order.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total ?? 0;

  // Ventas por día (últimos 7 días)
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
  }), { status: 200 });
}