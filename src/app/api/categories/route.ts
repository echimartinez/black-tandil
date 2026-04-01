import dbConnect from '@/lib/mongodb';
import Category from '@/model/Category';

export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
  return new Response(JSON.stringify(categories), { status: 200 });
}