import { Router } from 'express';
import {
  createTrip,
  getUserTrips,
  getTripDetails,
  addMemberToTrip,
  respondToInvite,
  endTrip,
} from '../controllers/trip.controller';
import { getAnalytics } from '../controllers/analytics.controller';
import { getItinerary, addActivity } from '../controllers/itinerary.controller';
import { getPackingList, addPackingItem, togglePackingItem, deletePackingItem } from '../controllers/packing.controller';
import { getChatMessages, sendChatMessage } from '../controllers/chat.controller';
import { getSettlements } from '../controllers/settlement.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All trip routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/trips/create
 * @desc    Create a new trip
 * @access  Private
 */
router.post('/create', createTrip);

/**
 * @route   GET /api/trips/user
 * @desc    Get all trips for the current user
 * @access  Private
 */
router.get('/user', getUserTrips);

/**
 * @route   GET /api/trips/:id
 * @desc    Get trip details with expenses and balances
 * @access  Private
 */
router.get('/:id', getTripDetails);

/**
 * @route   POST /api/trips/:id/add-member
 * @desc    Add a member to a trip
 * @access  Private (Only trip creator)
 */
router.post('/:id/add-member', addMemberToTrip);

/**
 * @route   POST /api/trips/:id/respond
 * @desc    Accept or reject trip invitation
 * @access  Private
 */
router.post('/:id/respond', respondToInvite);

/**
 * @route   POST /api/trips/:id/end
 * @desc    End a trip
 * @access  Private (Only trip creator)
 */
router.post('/:id/end', endTrip);

/**
 * @route   GET /api/trips/:id/settlements
 * @desc    Calculate and get settlement payments
 * @access  Private
 */
router.get('/:id/settlements', getSettlements);

/**
 * @route   GET /api/trips/:id/analytics
 * @desc    Get trip analytics (spending breakdown)
 * @access  Private
 */
router.get('/:id/analytics', getAnalytics);

/**
 * @route   GET /api/trips/:id/itinerary
 * @desc    Get trip itinerary (activities)
 * @access  Private
 */
router.get('/:id/itinerary', getItinerary);

/**
 * @route   POST /api/trips/:id/itinerary
 * @desc    Add activity to itinerary
 * @access  Private
 */
router.post('/:id/itinerary', addActivity);

/**
 * @route   GET /api/trips/:id/packing
 * @desc    Get packing list for trip
 * @access  Private
 */
router.get('/:id/packing', getPackingList);

/**
 * @route   POST /api/trips/:id/packing
 * @desc    Add item to packing list
 * @access  Private
 */
router.post('/:id/packing', addPackingItem);

/**
 * @route   PUT /api/trips/:id/packing
 * @desc    Toggle packing item checkbox
 * @access  Private
 */
router.put('/:id/packing', togglePackingItem);

/**
 * @route   DELETE /api/trips/:id/packing
 * @desc    Delete packing item
 * @access  Private
 */
router.delete('/:id/packing', deletePackingItem);

/**
 * @route   GET /api/trips/:id/chat
 * @desc    Get chat messages for trip
 * @access  Private
 */
router.get('/:id/chat', getChatMessages);

/**
 * @route   POST /api/trips/:id/chat
 * @desc    Send message in trip chat
 * @access  Private
 */
router.post('/:id/chat', sendChatMessage);

export default router;
