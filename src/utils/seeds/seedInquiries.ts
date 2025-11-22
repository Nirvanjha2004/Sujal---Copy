import { User, UserRole } from '../../models/User';
import { Property } from '../../models/Property';
import { Project } from '../../models/Project';
import { Inquiry, InquiryStatus } from '../../models/Inquiry';

export async function seedInquiries(users: User[]) {
  const buyers = users.filter(u => u.role === UserRole.BUYER);
  const properties = await Property.findAll({ limit: 10 });
  const projects = await Project.findAll({ limit: 5 });

  const inquiries = [
    // Property inquiries
    ...properties.slice(0, 5).map((property, index) => ({
      property_id: property.id,
      inquirer_id: buyers[index % buyers.length]?.id || null,
      name: ['Rajesh Kumar', 'Priya Sharma', 'Arjun Mehta', 'Sneha Reddy', 'Karan Malhotra'][index],
      email: `inquirer${index + 1}@example.com`,
      phone: `+91-987654321${index}`,
      message: `I am interested in this ${property.property_type}. Please share more details about pricing and availability.`,
      status: [InquiryStatus.NEW, InquiryStatus.CONTACTED, InquiryStatus.CLOSED, InquiryStatus.NEW, InquiryStatus.CONTACTED][index],
    })),
    // Project inquiries
    ...projects.slice(0, 3).map((project, index) => ({
      project_id: project.id,
      inquirer_id: buyers[(index + 2) % buyers.length]?.id || null,
      name: ['Amit Singh', 'Neha Verma', 'Rohit Kapoor'][index],
      email: `project_inquirer${index + 1}@example.com`,
      phone: `+91-987654322${index}`,
      message: `I am interested in ${project.name}. Please provide details about available units and pricing.`,
      status: [InquiryStatus.NEW, InquiryStatus.CONTACTED, InquiryStatus.NEW][index],
    })),
  ];

  for (const inquiryData of inquiries) {
    try {
      await Inquiry.create(inquiryData);
      console.log(`  💬 Created inquiry from ${inquiryData.name}`);
    } catch (error) {
      console.error(`❌ Error creating inquiry:`, error);
    }
  }
}
