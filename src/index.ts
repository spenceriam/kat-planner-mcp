import { main } from './server';

// Start the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});