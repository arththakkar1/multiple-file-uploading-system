# Multiple File Uploading System

A Next.js application for uploading multiple files efficiently, featuring a drag-and-drop interface.

## Features

- Upload multiple files at once
- Drag and drop file upload
- Modern UI built with Next.js
- Fast and responsive

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/arththakkar1/multiple-file-uploading-system
cd multiple-file-uploading
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
multiple-file-uploading/
├── app/
│   ├── components/
│   │   └── FileUpload.tsx
│   ├── page.tsx
│   └── ...other pages
├── public/
│   └── ...static files
├── styles/
│   └── globals.css
├── package.json
├── README.md
└── ...other config files
```

## About

This project uses Next.js and React to provide a seamless multiple file uploading experience.  
The drag-and-drop feature is implemented using React's `useRef` and `useState` hooks to handle file selection and drop events.  
Users can drag files into the upload area, and the selected files are previewed before uploading.  
All uploads are handled asynchronously for better performance and user experience.
