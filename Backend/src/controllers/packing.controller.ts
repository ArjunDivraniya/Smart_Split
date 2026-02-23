import { Response } from 'express';
import PackingItem from '../models/PackingItem.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Get Packing List
export const getPackingList = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const items = await PackingItem.find({ trip: id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    console.error('Get packing list error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Add Packing Item
export const addPackingItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { text, category } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const newItem = await PackingItem.create({
      trip: id,
      text,
      category: category || 'Other',
      addedBy: userId,
    });

    return res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error: any) {
    console.error('Add packing item error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Toggle Packing Item Checkbox
export const togglePackingItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, isChecked } = req.body;

    const updatedItem = await PackingItem.findByIdAndUpdate(itemId, { isChecked }, { new: true });

    return res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('Toggle packing item error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete Packing Item
export const deletePackingItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.query;

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID required' });
    }

    await PackingItem.findByIdAndDelete(itemId);

    return res.status(200).json({
      success: true,
      message: 'Item deleted',
    });
  } catch (error: any) {
    console.error('Delete packing item error:', error);
    return res.status(500).json({ message: error.message });
  }
};
