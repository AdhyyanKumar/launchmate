// FILE: api/updates.mjs
import clientPromise from './connect.mjs';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('launchmate');
  const projects = db.collection('projects');

  try {
    if (req.method === 'POST') {
      const { id, content } = req.body;

      if (!id || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const update = {
        content,
        createdAt: new Date().toISOString(),
      };

      const result = await projects.updateOne(
        { _id: new ObjectId(id) },
        { $push: { aiUpdates: update }, $set: { lastEdited: new Date().toISOString() } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json({ success: true, update });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('UPDATES API ERROR:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
