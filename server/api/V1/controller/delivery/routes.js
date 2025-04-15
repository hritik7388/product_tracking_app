import express from 'express';
import deliveryController from './controller.js'; // Adjust the path as necessary

const router = express.Router();

router.post('/assignDeliveryPerson', deliveryController.assignDeliveryPerson);

export default router;
