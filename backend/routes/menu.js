// routes/menu.js
import express from 'express';
import MenuItem from '../models/menuItem.js';  // Ensure this path is correct
import { protect } from '../middleware/auth.js';  // Ensure this path is correct

const router = express.Router();  // ✅ Declare the router

// GET /api/menu (fetch all menu items)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching menu items...');
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu items',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/menu (add new menu item)
router.post('/', protect, async (req, res) => {
  console.log('➕ Adding menu item...');
  console.log('req.body:', req.body);

  const { name, price, image, description } = req.body;

  // Basic validation
  if (!name || !price || typeof name !== 'string' || typeof price !== 'number') {
    return res.status(400).json({ 
      success: false, 
      message: 'Name and price are required (name as string, price as number)' 
    });
  }

  // Validate image (optional, for relative paths)
  if (image && (!image.startsWith('/products/') || image.includes('http'))) {
    return res.status(400).json({ 
      success: false, 
      message: 'Image must be a relative path starting with /products/ or left empty' 
    });
  }

  try {
    const newItem = new MenuItem({ name, price, image: image || '', description });
    await newItem.save();

    console.log('✅ Menu item added:', newItem);
    res.status(201).json({ 
      success: true, 
      message: 'Menu item added successfully', 
      item: newItem 
    });
  } catch (error) {
    console.error('❌ Error adding menu item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error adding menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/menu/:id (delete menu item)
router.delete('/:id', protect, async (req, res) => {
  console.log('🗑️ Deleting menu item...');
  console.log('ID:', req.params.id);

  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    console.log('✅ Menu item deleted:', deletedItem);
    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;  