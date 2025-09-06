import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize routes
let routesInitialized = false;

const initializeRoutes = async () => {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
};

// Export as Vercel serverless function
export default async (req, res) => {
  await initializeRoutes();
  return app(req, res);
};
