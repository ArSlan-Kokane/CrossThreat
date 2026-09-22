import { NextRequest, NextResponse } from 'next/server';
import { getAllApplicationsDB, getApplicationStatsDB, getApplicationsByStatusDB, getApplicationsByDepartmentDB, searchApplicationsDB } from '@/lib/recruitment/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const stats = searchParams.get('stats');
    
    // Return statistics if requested
    if (stats === 'true') {
      const statistics = getApplicationStatsDB();
      return NextResponse.json(statistics);
    }
    
    let applications;
    
    // Use specific queries for better performance
    if (status) {
      applications = getApplicationsByStatusDB(status as any);
    } else if (department) {
      applications = getApplicationsByDepartmentDB(department);
    } else if (search) {
      applications = searchApplicationsDB(search);
    } else {
      applications = getAllApplicationsDB();
    }
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}