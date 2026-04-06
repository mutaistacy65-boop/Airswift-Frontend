import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'
import { ObjectId } from 'mongodb'

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
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Category ID is required' })
  }

  try {
    const categoryId = new ObjectId(id)
  } catch (error) {
    return res.status(400).json({ message: 'Invalid category ID' })
  }

  const categoryId = new ObjectId(id)

  switch (req.method) {
    case 'PUT':
      try {
        const { name, description, icon } = req.body

        const updateData: any = {
          updatedAt: new Date()
        }

        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (icon !== undefined) updateData.icon = icon

        const result = await db.collection('jobcategories').updateOne(
          { _id: categoryId },
          { $set: updateData }
        )

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Category not found' })
        }

        const updatedCategory = await db.collection('jobcategories').findOne({ _id: categoryId })
        const jobCount = await db.collection('jobs').countDocuments({ category: updatedCategory.name })

        return res.status(200).json({
          ...updatedCategory,
          _id: updatedCategory._id.toString(),
          jobCount
        })
      } catch (error) {
        console.error('Error updating category:', error)
        return res.status(500).json({ message: 'Failed to update category' })
      }

    case 'DELETE':
      try {
        // Check if category is being used by any jobs
        const jobsUsingCategory = await db.collection('jobs').countDocuments({ category: id })
        if (jobsUsingCategory > 0) {
          return res.status(400).json({ message: 'Cannot delete category that is being used by jobs' })
        }

        const result = await db.collection('jobcategories').deleteOne({ _id: categoryId })

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Category not found' })
        }

        return res.status(200).json({ message: 'Category deleted successfully' })
      } catch (error) {
        console.error('Error deleting category:', error)
        return res.status(500).json({ message: 'Failed to delete category' })
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}