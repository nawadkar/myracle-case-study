# Testing Instructions Generator


## Overview
The Digital Product Testing Instructions Generator is a powerful web application designed to streamline the process of creating comprehensive test cases for digital products. By leveraging advanced AI technology, this tool automatically generates detailed, professional testing instructions based on uploaded screenshots, saving significant time and effort in quality assurance processes.

Deployed Link : https://myracle-case-study.vercel.app/   (turn off dark mode for best experience)

## Flowchart

![Excali](https://github.com/user-attachments/assets/e9cd4aa4-85d3-4812-addb-53a63ffb4d54)


## Prompting Strategy

This project employs a sophisticated prompting strategy to generate detailed test instructions from visual inputs using Google's Gemini AI model. Key aspects of the strategy include:

- **Structured Output**: Utilizes PydanticOutputParser for enforcing a specific schema.
- **Role-based Prompting**: Defines the AI's role as a professional test instruction generator.
- **Clear Task Description**: Outlines the objective of generating instructions from images.
- **Format Specification**: Includes explicit instructions for JSON output structure.
- **Context Integration**: Allows for additional user-provided context to tailor results.
- **Multimodal Input Processing**: Combines textual prompts with image data.
- **Post-processing**: Cleans and parses the AI response into the required format.


## Features

- **User-friendly Interface**: Upload 1-15 screenshots of your digital product with ease.
- **Context Input**: Provide additional information about the features for more accurate instructions.
- **AI-Powered Analysis**: Utilizes Google's Generative AI (Gemini) to analyze images and generate testing instructions.
- **Structured Output**: Generates detailed test cases including:
  - Description
  - Pre-conditions
  - Step-by-step testing instructions
  - Expected results
- **Formatted Display**: View generated instructions in a clean, easy-to-read layout.
- **Export Options**: Download instructions in both JSON and CSV formats.
- **Responsive Design**: Optimized for various screen sizes and devices.

## Screen Shots:

![image](https://github.com/user-attachments/assets/8b453ebe-3e2c-44f6-9cd2-1c222c089476)
![image](https://github.com/user-attachments/assets/9725e6f6-f538-4ccc-8105-5d3fd4e18cb6)
![image](https://github.com/user-attachments/assets/19534cdf-30a6-48fa-b51a-4ad5924fe95c)




## Technology Stack

- **Frontend**: Next.js
- **Backend**: FastAPI
- **AI Model**: Google Generative AI (Gemini)
- **Additional Libraries**: 
  - React
  - Tailwind CSS
  - Papa Parse (for CSV conversion)
  - File Saver (for download functionality)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- Google Cloud account with Generative AI API access

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/digital-product-testing-generator.git
   cd digital-product-testing-generator
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```
   cd ../backend
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the `frontend` directory and add:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```
   - Create a `.env` file in the `backend` directory and add your Google API key:
     ```
     GOOGLE_API_KEY=your_api_key_here
     ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   uvicorn app:app --reload
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Upload 1-15 screenshots of your digital product using the file input.
2. (Optional) Provide additional context in the text area.
3. Click "Generate Testing Instructions" to process the images.
4. View the generated instructions in the formatted display.
5. Download the instructions in JSON or CSV format as needed.

## Contributing

We welcome contributions to improve the Digital Product Testing Instructions Generator. Please feel free to submit issues, fork the repository and send pull requests!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- This project was developed as part of an AI internship assignment for Myracle.io.
- Special thanks to the Google Generative AI team for providing the Gemini model used in this project.
