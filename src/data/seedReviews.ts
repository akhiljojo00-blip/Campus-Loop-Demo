import { ProductReview, SellerProfileData } from '../types';

export const INITIAL_SEED_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    itemTitle: 'Higher Engineering Mathematics (B.S. Grewal)',
    itemCategory: 'Textbooks',
    sellerName: 'Aarav Sharma',
    reviewerName: 'Kunal M. (1st Year BCA)',
    rating: 5,
    comment: 'Met outside library steps as promised. The book was clean, pages intact, exactly as described in photos. Helped me save over ₹400 for first semester maths!',
    date: '3 days ago',
    timestamp: Date.now() - 259200000,
  },
  {
    id: 'rev-2',
    itemTitle: 'Casio fx-991EX ClassWiz Calculator',
    itemCategory: 'Study essentials',
    sellerName: 'Rohan Deshmukh',
    reviewerName: 'Shreya D. (2nd Year BCA)',
    rating: 5,
    comment: 'Super polite senior! Tested the matrix equations and display together at the canteen. Original protective slide cover included.',
    date: '1 week ago',
    timestamp: Date.now() - 604800000,
  },
  {
    id: 'rev-3',
    itemTitle: 'Programming in ANSI C',
    itemCategory: 'Textbooks',
    sellerName: 'Priya Nair',
    reviewerName: 'Aditya S. (1st Year BCA)',
    rating: 4,
    comment: 'Good clean copy covered with paper. Met on time at Block C lab corridor. Minor pencil underlining on pointer chapters but very readable.',
    date: '2 weeks ago',
    timestamp: Date.now() - 1209600000,
  },
  {
    id: 'rev-4',
    itemTitle: 'boAt Rockerz 450 Headphones',
    itemCategory: 'Electronics',
    sellerName: 'Karthik Verma',
    reviewerName: 'Nitin R. (3rd Year BCA)',
    rating: 5,
    comment: 'Sound quality is punchy and battery holds charge well for study sessions. Smooth peer handoff in hostel quad.',
    date: '3 weeks ago',
    timestamp: Date.now() - 1814400000,
  },
  {
    id: 'rev-5',
    itemTitle: 'Pure Cotton Lab Coat',
    itemCategory: 'College essentials',
    sellerName: 'Sneha Patel',
    reviewerName: 'Divya P. (1st Year Science)',
    rating: 5,
    comment: 'Washed and ironed properly! Saved me from having to buy an overpriced coat from the campus bookstore.',
    date: '1 month ago',
    timestamp: Date.now() - 2592000000,
  }
];

export const INITIAL_SELLER_PROFILES: Record<string, SellerProfileData> = {
  'Aarav Sharma': {
    name: 'Aarav Sharma',
    department: '3rd Year BCA / CSE',
    campusLocation: 'Central Library Steps',
    memberSince: 'Semester 3 (Aug 2025)',
    completedExchanges: 7,
    averageRating: 4.9,
    totalReviews: 8,
    ratingBreakdown: { 5: 7, 4: 1, 3: 0, 2: 0, 1: 0 }
  },
  'Rohan Deshmukh': {
    name: 'Rohan Deshmukh',
    department: 'Final Year BCA',
    campusLocation: 'Science Quad Cafeteria',
    memberSince: 'Semester 1 (Aug 2024)',
    completedExchanges: 12,
    averageRating: 4.8,
    totalReviews: 10,
    ratingBreakdown: { 5: 8, 4: 2, 3: 0, 2: 0, 1: 0 }
  },
  'Priya Nair': {
    name: 'Priya Nair',
    department: '2nd Year BCA',
    campusLocation: 'Block C Computer Lab',
    memberSince: 'Semester 2 (Jan 2026)',
    completedExchanges: 4,
    averageRating: 4.7,
    totalReviews: 5,
    ratingBreakdown: { 5: 4, 4: 1, 3: 0, 2: 0, 1: 0 }
  },
  'Karthik Verma': {
    name: 'Karthik Verma',
    department: '1st Year MCA',
    campusLocation: 'Hostel Block 3 Common Room',
    memberSince: 'Semester 1 (Aug 2025)',
    completedExchanges: 5,
    averageRating: 4.8,
    totalReviews: 6,
    ratingBreakdown: { 5: 5, 4: 1, 3: 0, 2: 0, 1: 0 }
  },
  'Sneha Patel': {
    name: 'Sneha Patel',
    department: '2nd Year Science',
    campusLocation: 'Biochemistry / Science Wing',
    memberSince: 'Semester 2 (Jan 2026)',
    completedExchanges: 3,
    averageRating: 5.0,
    totalReviews: 3,
    ratingBreakdown: { 5: 3, 4: 0, 3: 0, 2: 0, 1: 0 }
  }
};
