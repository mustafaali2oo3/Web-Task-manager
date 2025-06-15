import { jsPDF } from "jspdf"

// Create a new PDF document
const doc = new jsPDF()
let yPosition = 20
const pageHeight = 280
const margin = 20

// Helper function to add text with automatic page breaks
function addText(text, fontSize = 12, isBold = false, isTitle = false) {
  if (yPosition > pageHeight - 30) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(fontSize)
  if (isBold || isTitle) {
    doc.setFont(undefined, "bold")
  } else {
    doc.setFont(undefined, "normal")
  }

  if (isTitle) {
    doc.setTextColor(0, 100, 200) // Blue color for titles
  } else {
    doc.setTextColor(0, 0, 0) // Black for normal text
  }

  // Handle long text by splitting into lines
  const lines = doc.splitTextToSize(text, 170)
  lines.forEach((line) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = 20
    }
    doc.text(line, margin, yPosition)
    yPosition += fontSize * 0.5 + 2
  })

  yPosition += 5 // Extra spacing after text blocks
}

// Helper function to add a section
function addSection(title, content) {
  addText(title, 16, true, true)
  yPosition += 5
  addText(content, 12)
  yPosition += 10
}

// Helper function to add a bullet point
function addBullet(text) {
  if (yPosition > pageHeight - 30) {
    doc.addPage()
    yPosition = 20
  }
  doc.setFontSize(12)
  doc.setFont(undefined, "normal")
  doc.setTextColor(0, 0, 0)
  doc.text("•", margin, yPosition)

  const lines = doc.splitTextToSize(text, 160)
  lines.forEach((line, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = 20
    }
    doc.text(line, margin + 10, yPosition)
    if (index < lines.length - 1) yPosition += 14
  })
  yPosition += 18
}

// Start creating the document
console.log("Generating TaskFlow Documentation PDF...")

// Title Page
doc.setFontSize(24)
doc.setFont(undefined, "bold")
doc.setTextColor(0, 100, 200)
doc.text("TaskFlow", 105, 50, { align: "center" })

doc.setFontSize(18)
doc.setTextColor(100, 100, 100)
doc.text("Task Management Application", 105, 70, { align: "center" })

doc.setFontSize(14)
doc.setTextColor(0, 0, 0)
doc.text("Complete User Guide & Workflow Documentation", 105, 90, { align: "center" })

doc.setFontSize(12)
doc.text("Version 1.0", 105, 110, { align: "center" })
doc.text(new Date().toLocaleDateString(), 105, 125, { align: "center" })

// Add a simple logo representation
doc.setDrawColor(0, 100, 200)
doc.setFillColor(0, 100, 200)
doc.circle(105, 160, 20, "F")
doc.setTextColor(255, 255, 255)
doc.setFontSize(16)
doc.text("✓", 105, 165, { align: "center" })

yPosition = 200
doc.setTextColor(0, 0, 0)
addText(
  "This document provides a comprehensive guide to using TaskFlow, a modern task management application built with Next.js and Supabase.",
  12,
)

// Start new page for content
doc.addPage()
yPosition = 20

// Table of Contents
addText("Table of Contents", 18, true, true)
yPosition += 10

const tocItems = [
  "1. What is TaskFlow?",
  "2. Getting Started",
  "3. User Authentication",
  "4. Dashboard Overview",
  "5. Managing Tasks",
  "6. Projects & Organization",
  "7. Features & Functionality",
  "8. Technical Architecture",
  "9. Troubleshooting",
  "10. Frequently Asked Questions",
]

tocItems.forEach((item) => {
  addText(item, 12)
})

// Start content
doc.addPage()
yPosition = 20

// Section 1: What is TaskFlow?
addSection(
  "1. What is TaskFlow?",
  "TaskFlow is a modern, web-based task management application designed to help individuals and teams organize their work efficiently. Built with cutting-edge technology, it provides a clean, intuitive interface for managing tasks, projects, and deadlines.",
)

addText("Key Benefits:", 14, true)
addBullet("Simple and intuitive user interface")
addBullet("Real-time updates and synchronization")
addBullet("Secure user authentication")
addBullet("Project-based task organization")
addBullet("Priority management system")
addBullet("Responsive design for all devices")

// Section 2: Getting Started
addSection(
  "2. Getting Started",
  "Getting started with TaskFlow is simple and straightforward. Follow these steps to begin managing your tasks effectively.",
)

addText("Step 1: Access the Application", 14, true)
addText(
  "Open your web browser and navigate to the TaskFlow application URL. You will see the welcome page with login and registration options.",
)

addText("Step 2: Create an Account", 14, true)
addText('If you are a new user, click on the "Sign Up" tab and provide:')
addBullet("Your email address")
addBullet("A secure password")
addBullet("Confirm your password")

addText("Step 3: Sign In", 14, true)
addText("If you already have an account, simply enter your email and password in the login form.")

// Section 3: User Authentication
addSection(
  "3. User Authentication",
  "TaskFlow uses secure authentication to protect your data and ensure only you can access your tasks and projects.",
)

addText("Authentication Features:", 14, true)
addBullet("Secure password encryption")
addBullet("Session management")
addBullet("Automatic logout for security")
addBullet("Password reset functionality")

addText("Security Best Practices:", 14, true)
addBullet("Use a strong, unique password")
addBullet("Log out when using shared computers")
addBullet("Keep your login credentials private")

// Section 4: Dashboard Overview
addSection(
  "4. Dashboard Overview",
  "The dashboard is your central hub for managing tasks and getting an overview of your work. It provides quick access to all major features and displays important information at a glance.",
)

addText("Dashboard Components:", 14, true)
addBullet("Header with navigation and user information")
addBullet("Quick task creation form")
addBullet("Task workflow table")
addBullet("Priority indicators and status badges")
addBullet("Action buttons for task management")

addText("Navigation Elements:", 14, true)
addBullet("TaskFlow logo (returns to dashboard)")
addBullet("Refresh button to update data")
addBullet("User email display")
addBullet("Logout button")

// Section 5: Managing Tasks
addSection(
  "5. Managing Tasks",
  "Tasks are the core element of TaskFlow. You can create, edit, delete, and organize tasks to match your workflow needs.",
)

addText("Creating a New Task:", 14, true)
addText('1. Locate the "Add New Task" section at the top of the dashboard')
addText("2. Enter a descriptive title for your task")
addText("3. Select a priority level (Low, Medium, High)")
addText('4. Click the "Add Task" button or press Enter')

addText("Task Properties:", 14, true)
addBullet("Title: A clear, descriptive name for the task")
addBullet("Priority: Low, Medium, or High importance")
addBullet("Status: To Do, In Progress, or Done")
addBullet("Prioritized: Special flag for urgent tasks")
addBullet("Creation date: Automatically tracked")

addText("Task Actions:", 14, true)
addBullet("Edit: Modify the task title inline")
addBullet("Delete: Remove the task permanently")
addBullet("Prioritize: Mark as high-priority item")
addBullet("Status change: Update progress status")

// Section 6: Projects & Organization
addSection(
  "6. Projects & Organization",
  "TaskFlow allows you to organize your tasks into projects, making it easier to manage different areas of work or life.",
)

addText("Project Features:", 14, true)
addBullet("Create custom projects with names and descriptions")
addBullet("Assign color codes for visual organization")
addBullet("Associate tasks with specific projects")
addBullet("View project-specific task lists")

addText("Organization Tips:", 14, true)
addBullet('Use projects for different work areas (e.g., "Marketing", "Development")')
addBullet("Create personal projects for life management")
addBullet("Use descriptive project names")
addBullet("Choose distinct colors for easy identification")

// Section 7: Features & Functionality
addSection(
  "7. Features & Functionality",
  "TaskFlow includes many features designed to enhance your productivity and make task management effortless.",
)

addText("Core Features:", 14, true)
addBullet("Real-time task updates")
addBullet("Responsive design for mobile and desktop")
addBullet("Keyboard shortcuts for quick actions")
addBullet("Visual priority indicators")
addBullet("Task search and filtering")
addBullet("Automatic data synchronization")

addText("Advanced Features:", 14, true)
addBullet("Task prioritization system")
addBullet("Project color coding")
addBullet("Due date tracking")
addBullet("Status workflow management")
addBullet("User-specific data isolation")

// Section 8: Technical Architecture
addSection(
  "8. Technical Architecture",
  "TaskFlow is built using modern web technologies to ensure reliability, security, and performance.",
)

addText("Technology Stack:", 14, true)
addBullet("Frontend: Next.js with React")
addBullet("Backend: Next.js API Routes")
addBullet("Database: PostgreSQL via Supabase")
addBullet("Authentication: Supabase Auth")
addBullet("Styling: Tailwind CSS")
addBullet("UI Components: shadcn/ui")

addText("Key Benefits of This Architecture:", 14, true)
addBullet("Fast loading times and smooth interactions")
addBullet("Secure data handling and user authentication")
addBullet("Scalable infrastructure for growing needs")
addBullet("Real-time data synchronization")
addBullet("Cross-platform compatibility")

// Section 9: Troubleshooting
addSection(
  "9. Troubleshooting",
  "If you encounter any issues while using TaskFlow, here are some common solutions and troubleshooting steps.",
)

addText("Common Issues and Solutions:", 14, true)

addText("Authentication Problems:", 12, true)
addBullet("Clear your browser cache and cookies")
addBullet("Ensure you are using the correct email and password")
addBullet("Check your internet connection")
addBullet("Try refreshing the page")

addText("Tasks Not Loading:", 12, true)
addBullet("Click the refresh button in the header")
addBullet("Check your internet connection")
addBullet("Log out and log back in")
addBullet("Clear browser cache if problems persist")

addText("Performance Issues:", 12, true)
addBullet("Close unnecessary browser tabs")
addBullet("Ensure you have a stable internet connection")
addBullet("Try using a different browser")
addBullet("Restart your browser")

// Section 10: FAQ
addSection("10. Frequently Asked Questions", "Here are answers to commonly asked questions about TaskFlow.")

addText("Q: Is my data secure?", 12, true)
addText(
  "A: Yes, TaskFlow uses industry-standard security practices including encrypted data transmission, secure authentication, and user-specific data isolation.",
)

addText("Q: Can I access TaskFlow on my mobile device?", 12, true)
addText("A: Yes, TaskFlow is fully responsive and works on all devices including smartphones and tablets.")

addText("Q: How many tasks can I create?", 12, true)
addText(
  "A: There is no limit to the number of tasks you can create. The system is designed to handle large numbers of tasks efficiently.",
)

addText("Q: Can I share tasks with other users?", 12, true)
addText("A: Currently, TaskFlow is designed for individual use. Each user has their own private workspace.")

addText("Q: What happens if I forget my password?", 12, true)
addText("A: You can use the password reset feature on the login page to receive a reset link via email.")

addText("Q: Is TaskFlow free to use?", 12, true)
addText("A: Please check with your administrator or the application provider for current pricing and usage terms.")

// Workflow Diagram Page
doc.addPage()
yPosition = 20

addText("TaskFlow Workflow Diagram", 18, true, true)
yPosition += 20

// Simple workflow representation
doc.setDrawColor(0, 100, 200)
doc.setFillColor(240, 248, 255)

// Start box
doc.roundedRect(20, yPosition, 40, 20, 3, 3, "FD")
doc.text("Start", 40, yPosition + 12, { align: "center" })

// Arrow
doc.line(60, yPosition + 10, 80, yPosition + 10)
doc.polygon(
  [
    [80, yPosition + 10],
    [75, yPosition + 7],
    [75, yPosition + 13],
  ],
  "F",
)

// Login box
doc.roundedRect(85, yPosition, 40, 20, 3, 3, "FD")
doc.text("Login", 105, yPosition + 12, { align: "center" })

yPosition += 40

// Arrow down
doc.line(105, yPosition - 20, 105, yPosition)
doc.polygon(
  [
    [105, yPosition],
    [102, yPosition - 5],
    [108, yPosition - 5],
  ],
  "F",
)

// Dashboard box
doc.roundedRect(85, yPosition, 40, 20, 3, 3, "FD")
doc.text("Dashboard", 105, yPosition + 12, { align: "center" })

yPosition += 40

// Three branches
doc.line(105, yPosition - 20, 105, yPosition - 10)
doc.line(60, yPosition - 10, 150, yPosition - 10)

// Create Task
doc.line(70, yPosition - 10, 70, yPosition)
doc.roundedRect(50, yPosition, 40, 20, 3, 3, "FD")
doc.text("Create Task", 70, yPosition + 12, { align: "center" })

// Manage Tasks
doc.line(105, yPosition - 10, 105, yPosition)
doc.roundedRect(85, yPosition, 40, 20, 3, 3, "FD")
doc.text("Manage Tasks", 105, yPosition + 12, { align: "center" })

// View Projects
doc.line(140, yPosition - 10, 140, yPosition)
doc.roundedRect(120, yPosition, 40, 20, 3, 3, "FD")
doc.text("View Projects", 140, yPosition + 12, { align: "center" })

yPosition += 40

addText("Workflow Steps:", 14, true)
addText("1. User accesses the application")
addText("2. User logs in with email and password")
addText("3. Dashboard loads with current tasks")
addText("4. User can create new tasks, manage existing ones, or view projects")
addText("5. All changes are automatically saved and synchronized")

// Footer
doc.setFontSize(10)
doc.setTextColor(100, 100, 100)
doc.text("TaskFlow Documentation - Generated on " + new Date().toLocaleDateString(), 105, 280, { align: "center" })

// Save the PDF
doc.save("TaskFlow-Documentation.pdf")

console.log("PDF documentation generated successfully!")
console.log("File saved as: TaskFlow-Documentation.pdf")
