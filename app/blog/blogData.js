import React from 'react';
import { generateUcrPosts } from './ucrData';

const ucrPosts = generateUcrPosts();

export const blogPosts = [
  ...ucrPosts,
];
