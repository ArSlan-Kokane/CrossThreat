import { NextRequest, NextResponse } from 'next/server';
import { createApplicationDB } from '@/lib/recruitment/database';
import { validateFormData, sanitizeFormData } from '@/lib/recruitment/validation';
import { RecruitmentFormData } from '@/lib/recruitment/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.personalInfo || !body.departmentInterest || !body.skills || !body.responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate form data
    const validationResult = validateFormData(body as RecruitmentFormData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }
    
    // Sanitize input
    const sanitizedData = sanitizeFormData(body as RecruitmentFormData);
    
    // Create application using SQLite database
    const application = createApplicationDB(sanitizedData);
    
    return NextResponse.json(
      { 
        success: true, 
        applicationId: application.id,
        message: 'Application submitted successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}