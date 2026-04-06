import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin authentication
  let decoded: any = null
  try {
    decoded = await verifyToken(req)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await connectDB()
  const db = mongoose.connection.db

  switch (req.method) {
    case 'GET':
      try {
        const categories = await db.collection('jobcategories').find({}).sort({ name: 1 }).toArray()

        // Get job counts for each category
        const categoriesWithCounts = await Promise.all(
          categories.map(async (category) => {
            const jobCount = await db.collection('jobs').countDocuments({ category: category.name })
            return {
              ...category,
              _id: category._id.toString(),
              jobCount
            }
          })
        )

        return res.status(200).json(categoriesWithCounts)
      } catch (error) {
        console.error('Error fetching categories:', error)
        return res.status(500).json({ message: 'Failed to fetch categories' })
      }

    case 'POST':
      try {
        const { name, description, icon } = req.body

        if (!name) {
          return res.status(400).json({ message: 'Category name is required' })
        }

        // Check if category already exists
        const existingCategory = await db.collection('jobcategories').findOne({ name })
        if (existingCategory) {
          return res.status(400).json({ message: 'Category already exists' })
        }

        const newCategory = {
          name,
          description: description || '',
          icon: icon || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('jobcategories').insertOne(newCategory)

        return res.status(201).json({
          ...newCategory,
          _id: result.insertedId.toString()
        })
      } catch (error) {
        console.error('Error creating category:', error)
        return res.status(500).json({ message: 'Failed to create category' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}