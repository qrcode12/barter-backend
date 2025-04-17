import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';

const router = Router();

// Get all advertisements
router.get('/', async (req: Request, res: Response) => {
  try {
    const advertisements = await storage.getAllAdvertisements();
    res.json(advertisements);
  } catch (error) {
    console.error('Error getting advertisements:', error);
    res.status(500).json({ message: 'Error getting advertisements' });
  }
});

// Get advertisement by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const advertisement = await storage.getAdvertisement(id);

    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    res.json(advertisement);
  } catch (error) {
    console.error('Error getting advertisement:', error);
    res.status(500).json({ message: 'Error getting advertisement' });
  }
});

// Get advertisement by position
router.get('/position/:position', async (req: Request, res: Response) => {
  try {
    const position = req.params.position as 'left' | 'right';

    if (position !== 'left' && position !== 'right') {
      return res.status(400).json({ message: 'Invalid position' });
    }

    const advertisement = await storage.getActiveAdvertisement(position);

    if (!advertisement) {
      return res.status(404).json({ message: 'No active advertisement found for this position' });
    }

    res.json(advertisement);
  } catch (error) {
    console.error('Error getting advertisement by position:', error);
    res.status(500).json({ message: 'Error getting advertisement' });
  }
});

// Admin routes
const adminRouter = Router();

// Get all advertisements (admin)
adminRouter.get('/', async (req: Request, res: Response) => {
  try {
    const advertisements = await storage.getAllAdvertisements();
    res.json(advertisements);
  } catch (error) {
    console.error('Error getting advertisements:', error);
    res.status(500).json({ message: 'Error getting advertisements' });
  }
});

// Create advertisement
adminRouter.post('/', async (req: Request, res: Response) => {
  try {
    const advertisementData = req.body;

    // Validate required fields
    if (!advertisementData.title || !advertisementData.position) {
      return res.status(400).json({ message: 'Title and position are required' });
    }

    // Using generic insert method since createAdvertisement doesn't exist
    const advertisement = await (storage as any).insert('advertisements', advertisementData);
    res.status(201).json(advertisement);
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({ message: 'Error creating advertisement' });
  }
});

// Update advertisement
adminRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const advertisementData = req.body;

    // Using generic update method since updateAdvertisement doesn't exist
    const advertisement = await (storage as any).update('advertisements', id, advertisementData);

    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    res.json(advertisement);
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({ message: 'Error updating advertisement' });
  }
});

// Delete advertisement
adminRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Using generic delete method since deleteAdvertisement doesn't exist
    const success = await (storage as any).delete('advertisements', id);

    if (!success) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    res.status(200).json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({ message: 'Error deleting advertisement' });
  }
});

export { router, adminRouter };