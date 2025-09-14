<p align="center">
  <img src="/frontend/images/favicon.webp" alt="SEO Content Processor Logo" width="200" height="200">
</p>

<h1 align="center">SEO Content Processor</h1>

<p align="center">
A simple web application that takes your article title and content and automatically creates SEO-friendly elements like URL slugs, shortened titles, and meta descriptions. This tool helps content creators optimize their articles for search engines.
</p>

<hr>

## What This Application Does

This tool processes your article content and generates three important SEO elements:

- **URL Slug**: Converts your title into a clean, web-friendly URL (example: "My Great Article" becomes "my-great-article")
- **SEO Title**: Shortens your title to 60 characters or less for optimal search engine display
- **Meta Description**: Creates a 160-character summary of your content for search engine results

## What You Need Before Starting

Before you can run this application, make sure you have these programs installed on your computer:

1. **Node.js** (version 14 or newer)
   - This is the runtime that allows JavaScript to run on your computer
   - Download from: https://nodejs.org/
   - Choose the "LTS" (Long Term Support) version

2. **npm** (Node Package Manager)
   - This comes automatically with Node.js installation
   - It helps download and manage code libraries

## How to Install and Run the Application

### Step 1: Get the Code
Download or copy this project to a folder on your computer.

### Step 2: Open Your Command Line
- **Windows**: Open Command Prompt or PowerShell
- **Mac**: Open Terminal
- **Linux**: Open your terminal application

### Step 3: Navigate to the Project
Use the command line to go to the project folder. Type:
```
cd path/to/seo-content-processor
```
Replace "path/to/seo-content-processor" with the actual location where you saved the project.

### Step 4: Go to the Backend Folder
Once you are in the project folder, navigate to the backend directory:
```
cd backend
```

### Step 5: Install Required Libraries
The application needs some additional code libraries to work. Install them by typing:
```
npm install
```
This command will automatically download and install everything the application needs. You will see some text scrolling by - this is normal.

### Step 6: Start the Application
Now start the application server by typing:
```
npm start
```
You should see a message saying "Server running at http://localhost:3001"

### Step 7: Use the Application
1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Type this address in the address bar: `http://localhost:3001`
3. Press Enter

You will now see the SEO Content Processor interface.

## How to Use the Application

1. **Enter Your Article Title**: Type your article title in the first text box
2. **Add Your Content**: Paste or type your article content in the large text area
3. **Click Generate SEO**: Press the blue "Generate SEO" button
4. **View Results**: The application will show you three results:
   - The URL-friendly slug
   - Your optimized SEO title
   - A meta description created from your content

## Sample Results

Here is an example of what the application generates:

![Quick Start](/frontend/images/quick-start.webp)
![Sample SEO Results](/frontend/images/results-example1.webp)
![Sample SEO Results](/frontend/images/results-example2.webp)

The image above shows how the application processes a sample article about "How to Build a Scalable Full-Stack Application" and generates clean, SEO-optimized metadata that you can use for your website or blog.

## Stopping the Application

When you are finished using the application:
1. Go back to your command line window
2. Press `Ctrl+C` (on Windows/Linux) or `Cmd+C` (on Mac)
3. This will stop the server

## For Developers

If you want to make changes to the code and have the application automatically restart when you save changes, use this command instead of `npm start`:
```
npm run dev
```

## Project Structure

The application is organized into two main parts:

```
seo-content-processor/
├── backend/                # Server-side code
│   ├── server.js          # Main application file
│   └── package.json       # List of required libraries
├── frontend/               # User interface files
│   ├── index.html         # The webpage you see
│   ├── style.css          # Visual styling
│   └── script.js          # Interactive functionality
└── README.md              # This instruction file
```

## Troubleshooting

**Problem**: "npm is not recognized" or "command not found"
- **Solution**: Node.js is not installed or not in your system PATH. Reinstall Node.js from nodejs.org

**Problem**: "Port 3001 is already in use"
- **Solution**: Another application is using port 3001. Either stop that application or change the port number in server.js

**Problem**: The webpage shows "This site can't be reached"
- **Solution**: Make sure the server is running (you should see "Server running at..." in your command line)

**Problem**: Getting error messages when running `npm install`
- **Solution**: Try running the command line as administrator (Windows) or with `sudo` (Mac/Linux)

## Technology Information

This application uses:
- **Backend**: Node.js with Express.js framework
- **Frontend**: Pure HTML, CSS, and JavaScript (no additional frameworks)
- **API**: Simple REST endpoint for processing content

The entire application runs locally on your computer and does not require an internet connection once installed.

## Contact

If you have questions about this project or would like to get in touch:

- **Email**: gabrieldominicoxibillo@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/gabrieldominicoxibillo/

