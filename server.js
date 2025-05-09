// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Define the port number the server will listen on
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
// Create an instance of an Express application
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// const name = process.env.NAME;
// Define a route handler for the root URL ('/')
// app.get('/', (req, res) => {
//     res.send(`Hello, ${name}!`); // <-- UPDATED
// });

// Set the view engine to EJS
app.set('view engine', 'ejs');
 
// Set the views directory (where your templates are located)
app.set('views', path.join(__dirname, 'src/views'));

// Middleware to add current year to res.locals
app.use((req, res, next) => {
    // Get the current year for copyright notice
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// Example of the refactored home route:
app.get('/', (req, res) => {
    const title = 'Home Page';
    const content = '<h1>Welcome to the Home Page</h1><p>This is the main content of the home page.</p>';
    res.render('index', { title, content, NODE_ENV, PORT });
}); 

app.get('/products', (req, res) => {
    const title = 'Products Page';
    const content = '<h1>Welcome to the Contact Page</h1><p>This is the main content of the contact page.</p>';
    res.render('index', { title, content, NODE_ENV, PORT });
}); 

app.get('/about', (req, res) => {
    const title = 'About Page';
    const content = '<h1>Welcome to the About Page</h1><p>This is the main content of the about page.</p>';
    res.render('index', { title, content, NODE_ENV, PORT });
}); 

// Test route that deliberately throws an error
app.get('/test-error', (req, res, next) => {
    try {
        // Intentionally trigger an error
        const nonExistentVariable = undefinedVariable;
        res.send('This will never be reached');
    } catch (err) {
        // Forward the error to the global error handler
        next(err);
    }
});

// Test route that explicitly creates and forwards an error
app.get('/manual-error', (req, res, next) => {
    const err = new Error('This is a manually triggered error');
    err.status = 500;
    next(err); // Forward to the global error handler
});

// Basic route with parameters for the EXPLORE ASSIGNMENT
app.get('/explore/:category/:id', (req, res) => {
    // Get route parameters
    const { category, id } = req.params;
 
    // Get query parameters (optional)
    const { sort = 'default', filter = 'none' } = req.query;
 
    // Log all parameters for debugging
    console.log('Route Parameters:', req.params);
    console.log('Query Parameters:', req.query);
 
    // Set the title for the page
    const title = `Exploring ${category}`;
 
    // Render the template with all parameters
    res.render('explore', { title, category, id, sort, filter, NODE_ENV });
});

/**
 * Error Handling Middleware
 */
 
// Catch-all middleware for unmatched routes (404)
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err); // Forward to the global error handler
});

// Global error handler middleware
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(err.stack);
 
    // Set default status and determine error type
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: err.stack,
        // mode,
        // port
    };
 
    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});

// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');
 
    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });
 
        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });
 
        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}
 
// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});