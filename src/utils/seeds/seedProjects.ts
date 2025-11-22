import { User, UserRole } from '../../models/User';
import { Project, ProjectStatus, ProjectType } from '../../models/Project';
import { ProjectImage } from '../../models/ProjectImage';
import { ProjectUnit, UnitStatus } from '../../models/ProjectUnit';

export async function seedProjects(users: User[]) {
    const builders = users.filter(u => u.role === UserRole.BUILDER);

    const projects = [
        // RESIDENTIAL PROJECTS (5)
        {
            builder_id: builders[0].id,
            name: 'DLF Garden City',
            description: 'Premium residential project with world-class amenities and green spaces.',
            location: 'Sector 92, Gurgaon',
            address: 'NH-8, Sector 92',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122505',
            project_type: ProjectType.RESIDENTIAL,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 500,
            available_units: 320,
            sold_units: 150,
            blocked_units: 30,
            start_date: new Date('2023-01-15'),
            expected_completion: new Date('2025-12-31'),
            rera_number: 'RERA-GRG-PROJ-123-2023',
            approval_status: 'approved',
            amenities: ['Swimming Pool', 'Gym', 'Club House', 'Kids Play Area', 'Jogging Track', 'Security'],
            specifications: {
                floors: 25,
                towers: 4,
                parking: 'Multi-level basement parking'
            },
            pricing: {
                min_price: 8500000,
                max_price: 25000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[1].id,
            name: 'Godrej Splendour',
            description: 'Luxury residential apartments with modern architecture and premium amenities.',
            location: 'Whitefield, Bangalore',
            address: 'ITPL Main Road, Whitefield',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560066',
            project_type: ProjectType.RESIDENTIAL,
            status: ProjectStatus.READY_TO_MOVE,
            total_units: 300,
            available_units: 45,
            sold_units: 240,
            blocked_units: 15,
            start_date: new Date('2021-06-01'),
            expected_completion: new Date('2024-03-31'),
            actual_completion: new Date('2024-02-15'),
            rera_number: 'RERA-BLR-PROJ-456-2021',
            approval_status: 'approved',
            amenities: ['Swimming Pool', 'Gym', 'Club House', 'Tennis Court', 'Landscaped Gardens'],
            specifications: {
                floors: 20,
                towers: 3,
                parking: 'Covered parking'
            },
            pricing: {
                min_price: 12000000,
                max_price: 35000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[2].id,
            name: 'Prestige Lakeside Habitat',
            description: 'Waterfront residential project with stunning lake views and premium lifestyle.',
            location: 'Varthur, Bangalore',
            address: 'Varthur Main Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560087',
            project_type: ProjectType.RESIDENTIAL,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 800,
            available_units: 600,
            sold_units: 180,
            blocked_units: 20,
            start_date: new Date('2023-09-01'),
            expected_completion: new Date('2026-08-31'),
            rera_number: 'RERA-BLR-PROJ-789-2023',
            approval_status: 'approved',
            amenities: ['Swimming Pool', 'Gym', 'Club House', 'Spa', 'Yoga Center', 'Amphitheater'],
            specifications: {
                floors: 30,
                towers: 6,
                parking: 'Multi-level parking'
            },
            pricing: {
                min_price: 9500000,
                max_price: 28000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[3].id,
            name: 'Lodha Amara',
            description: 'Ultra-luxury residential towers with panoramic city views.',
            location: 'Thane West, Mumbai',
            address: 'Pokhran Road No. 2',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400610',
            project_type: ProjectType.RESIDENTIAL,
            status: ProjectStatus.PRE_LAUNCH,
            total_units: 450,
            available_units: 450,
            sold_units: 0,
            blocked_units: 0,
            start_date: new Date('2024-06-01'),
            expected_completion: new Date('2027-05-31'),
            rera_number: 'RERA-MUM-PROJ-234-2024',
            approval_status: 'pending',
            amenities: ['Infinity Pool', 'Gym', 'Club House', 'Concierge Service', 'Sky Lounge'],
            specifications: {
                floors: 35,
                towers: 3,
                parking: 'Automated parking'
            },
            pricing: {
                min_price: 15000000,
                max_price: 45000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[4].id,
            name: 'Sobha Dream Acres',
            description: 'Integrated township with residential apartments and villas.',
            location: 'Balagere, Bangalore',
            address: 'Varthur-Sarjapur Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560103',
            project_type: ProjectType.RESIDENTIAL,
            status: ProjectStatus.COMPLETED,
            total_units: 1200,
            available_units: 0,
            sold_units: 1200,
            blocked_units: 0,
            start_date: new Date('2018-01-01'),
            expected_completion: new Date('2022-12-31'),
            actual_completion: new Date('2022-11-15'),
            rera_number: 'RERA-BLR-PROJ-567-2018',
            approval_status: 'approved',
            amenities: ['Swimming Pool', 'Gym', 'Club House', 'School', 'Hospital', 'Shopping Complex'],
            specifications: {
                floors: 18,
                towers: 12,
                parking: 'Covered parking'
            },
            pricing: {
                min_price: 7500000,
                max_price: 22000000
            },
            is_active: false,
            featured: false,
        },

        // APARTMENT PROJECTS (3)
        {
            builder_id: builders[0].id,
            name: 'DLF Ultima',
            description: 'Super luxury apartment project with exclusive amenities.',
            location: 'Sector 81, Gurgaon',
            address: 'Golf Course Extension Road',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122004',
            project_type: ProjectType.APARTMENT,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 250,
            available_units: 180,
            sold_units: 60,
            blocked_units: 10,
            start_date: new Date('2023-03-01'),
            expected_completion: new Date('2025-12-31'),
            rera_number: 'RERA-GRG-PROJ-890-2023',
            approval_status: 'approved',
            amenities: ['Private Pool', 'Gym', 'Spa', 'Concierge', 'Helipad'],
            specifications: {
                floors: 40,
                towers: 2,
                parking: 'Valet parking'
            },
            pricing: {
                min_price: 35000000,
                max_price: 85000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[1].id,
            name: 'Godrej Meridien',
            description: 'Premium apartments with smart home features.',
            location: 'Sector 106, Gurgaon',
            address: 'Dwarka Expressway',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122006',
            project_type: ProjectType.APARTMENT,
            status: ProjectStatus.READY_TO_MOVE,
            total_units: 400,
            available_units: 85,
            sold_units: 300,
            blocked_units: 15,
            start_date: new Date('2021-08-01'),
            expected_completion: new Date('2024-07-31'),
            actual_completion: new Date('2024-06-30'),
            rera_number: 'RERA-GRG-PROJ-345-2021',
            approval_status: 'approved',
            amenities: ['Swimming Pool', 'Gym', 'Club House', 'Smart Home', 'EV Charging'],
            specifications: {
                floors: 28,
                towers: 4,
                parking: 'Covered parking'
            },
            pricing: {
                min_price: 11000000,
                max_price: 28000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[2].id,
            name: 'Prestige Falcon City',
            description: 'Affordable luxury apartments with modern amenities.',
            location: 'Kanakapura Road, Bangalore',
            address: 'Kanakapura Main Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560062',
            project_type: ProjectType.APARTMENT,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 600,
            available_units: 450,
            sold_units: 130,
            blocked_units: 20,
            start_date: new Date('2023-11-01'),
            expected_completion: new Date('2026-10-31'),
            rera_number: 'RERA-BLR-PROJ-678-2023',
            approval_status: 'approved',
            amenities: ['Swimming Pool', 'Gym', 'Club House', 'Indoor Games', 'Jogging Track'],
            specifications: {
                floors: 22,
                towers: 5,
                parking: 'Multi-level parking'
            },
            pricing: {
                min_price: 6500000,
                max_price: 18000000
            },
            is_active: true,
            featured: false,
        },

        // VILLA PROJECTS (2)
        {
            builder_id: builders[3].id,
            name: 'Lodha Belmondo',
            description: 'Luxury villa project with private gardens and premium amenities.',
            location: 'Gahunje, Pune',
            address: 'Mumbai-Pune Expressway',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '412115',
            project_type: ProjectType.VILLA,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 150,
            available_units: 95,
            sold_units: 50,
            blocked_units: 5,
            start_date: new Date('2023-05-01'),
            expected_completion: new Date('2025-12-31'),
            rera_number: 'RERA-PUN-PROJ-456-2023',
            approval_status: 'approved',
            amenities: ['Private Pool', 'Club House', 'Golf Course', 'Spa', 'Security'],
            specifications: {
                floors: 2,
                villa_types: '3BHK, 4BHK, 5BHK',
                parking: 'Private parking'
            },
            pricing: {
                min_price: 25000000,
                max_price: 65000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[4].id,
            name: 'Sobha Lifestyle Legacy',
            description: 'Premium villas with contemporary design and luxury living.',
            location: 'Devanahalli, Bangalore',
            address: 'Bellary Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '562110',
            project_type: ProjectType.VILLA,
            status: ProjectStatus.PRE_LAUNCH,
            total_units: 200,
            available_units: 200,
            sold_units: 0,
            blocked_units: 0,
            start_date: new Date('2024-08-01'),
            expected_completion: new Date('2027-07-31'),
            rera_number: 'RERA-BLR-PROJ-901-2024',
            approval_status: 'pending',
            amenities: ['Private Pool', 'Club House', 'Tennis Court', 'Gym', 'Landscaped Gardens'],
            specifications: {
                floors: 2,
                villa_types: '4BHK, 5BHK',
                parking: 'Private parking'
            },
            pricing: {
                min_price: 32000000,
                max_price: 75000000
            },
            is_active: true,
            featured: true,
        },

        // COMMERCIAL PROJECTS (3)
        {
            builder_id: builders[0].id,
            name: 'DLF Cyber Hub',
            description: 'Premium commercial office spaces with modern infrastructure.',
            location: 'Cyber City, Gurgaon',
            address: 'DLF Phase 2',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122002',
            project_type: ProjectType.COMMERCIAL,
            status: ProjectStatus.COMPLETED,
            total_units: 100,
            available_units: 12,
            sold_units: 85,
            blocked_units: 3,
            start_date: new Date('2019-01-01'),
            expected_completion: new Date('2022-12-31'),
            actual_completion: new Date('2022-10-15'),
            rera_number: 'RERA-GRG-COMM-123-2019',
            approval_status: 'approved',
            amenities: ['Central AC', 'Power Backup', 'Security', 'Cafeteria', 'Conference Rooms'],
            specifications: {
                floors: 15,
                towers: 1,
                parking: 'Multi-level parking'
            },
            pricing: {
                min_price: 15000000,
                max_price: 50000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[1].id,
            name: 'Godrej BKC',
            description: 'Grade A commercial office spaces in prime business district.',
            location: 'Bandra Kurla Complex, Mumbai',
            address: 'BKC, Bandra East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400051',
            project_type: ProjectType.OFFICE,
            status: ProjectStatus.READY_TO_MOVE,
            total_units: 80,
            available_units: 18,
            sold_units: 60,
            blocked_units: 2,
            start_date: new Date('2020-03-01'),
            expected_completion: new Date('2023-12-31'),
            actual_completion: new Date('2023-11-30'),
            rera_number: 'RERA-MUM-COMM-234-2020',
            approval_status: 'approved',
            amenities: ['Central AC', 'Power Backup', 'Security', 'Gym', 'Food Court'],
            specifications: {
                floors: 20,
                towers: 1,
                parking: 'Basement parking'
            },
            pricing: {
                min_price: 25000000,
                max_price: 80000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[2].id,
            name: 'Prestige Tech Park',
            description: 'IT/ITES office spaces with state-of-the-art facilities.',
            location: 'Sarjapur Road, Bangalore',
            address: 'Outer Ring Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560103',
            project_type: ProjectType.OFFICE,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 120,
            available_units: 95,
            sold_units: 20,
            blocked_units: 5,
            start_date: new Date('2023-07-01'),
            expected_completion: new Date('2025-12-31'),
            rera_number: 'RERA-BLR-COMM-345-2023',
            approval_status: 'approved',
            amenities: ['Central AC', 'Power Backup', 'Security', 'Cafeteria', 'Gym', 'Helipad'],
            specifications: {
                floors: 18,
                towers: 2,
                parking: 'Multi-level parking'
            },
            pricing: {
                min_price: 12000000,
                max_price: 45000000
            },
            is_active: true,
            featured: false,
        },

        // RETAIL/MIXED USE (2)
        {
            builder_id: builders[3].id,
            name: 'Lodha Supremus',
            description: 'Mixed-use development with retail, office, and residential spaces.',
            location: 'Lower Parel, Mumbai',
            address: 'Senapati Bapat Marg',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400013',
            project_type: ProjectType.MIXED_USE,
            status: ProjectStatus.UNDER_CONSTRUCTION,
            total_units: 350,
            available_units: 280,
            sold_units: 60,
            blocked_units: 10,
            start_date: new Date('2023-04-01'),
            expected_completion: new Date('2026-03-31'),
            rera_number: 'RERA-MUM-MIX-567-2023',
            approval_status: 'approved',
            amenities: ['Shopping Mall', 'Food Court', 'Cinema', 'Gym', 'Swimming Pool'],
            specifications: {
                floors: 45,
                towers: 2,
                parking: 'Multi-level parking'
            },
            pricing: {
                min_price: 18000000,
                max_price: 95000000
            },
            is_active: true,
            featured: true,
        },
        {
            builder_id: builders[4].id,
            name: 'Sobha City Mall',
            description: 'Premium retail mall with entertainment and dining options.',
            location: 'Thanisandra, Bangalore',
            address: 'Thanisandra Main Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560077',
            project_type: ProjectType.RETAIL,
            status: ProjectStatus.READY_TO_MOVE,
            total_units: 200,
            available_units: 45,
            sold_units: 145,
            blocked_units: 10,
            start_date: new Date('2021-01-01'),
            expected_completion: new Date('2023-12-31'),
            actual_completion: new Date('2023-11-15'),
            rera_number: 'RERA-BLR-RET-678-2021',
            approval_status: 'approved',
            amenities: ['Food Court', 'Cinema', 'Gaming Zone', 'Parking', 'Security'],
            specifications: {
                floors: 5,
                towers: 1,
                parking: 'Multi-level parking'
            },
            pricing: {
                min_price: 8000000,
                max_price: 35000000
            },
            is_active: true,
            featured: false,
        },
    ];

    let createdCount = 0;
    for (const projectData of projects) {
        try {
            const project = await Project.create(projectData);
            console.log(`  🏗️ Created project: ${project.name} in ${project.city}`);

            // Add sample project images
            await addProjectImages(project.id);

            // Add sample units for residential/apartment/villa projects
            if ([ProjectType.RESIDENTIAL, ProjectType.APARTMENT, ProjectType.VILLA].includes(project.project_type)) {
                await addProjectUnits(project.id, project.project_type);
            }

            createdCount++;
        } catch (error) {
            console.error(`❌ Error creating project: ${projectData.name}`, error);
        }
    }

    console.log(`✅ Created ${createdCount} projects`);
}

async function addProjectImages(projectId: number) {
    const imageTypes = ['exterior', 'interior', 'amenity', 'floor_plan', 'site_plan', 'location', 'gallery'];
    const images = [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ];

    for (let i = 0; i < images.length; i++) {
        await ProjectImage.create({
            project_id: projectId,
            image_url: images[i],
            alt_text: `Project Image ${i + 1}`,
            image_type: imageTypes[i % imageTypes.length] as any,
            is_primary: i === 0,
            display_order: i + 1,
        });
    }
}

async function addProjectUnits(projectId: number, projectType: ProjectType) {
    const unitTypes = projectType === ProjectType.VILLA ? ['4BHK', '5BHK'] : ['1BHK', '2BHK', '3BHK', '4BHK'];
    const unitsToCreate = 5; // Create 5 sample units per project

    for (let i = 0; i < unitsToCreate; i++) {
        const unitType = unitTypes[i % unitTypes.length];
        const bedrooms = parseInt(unitType.charAt(0));
        const area_sqft = bedrooms * 600 + 400;
        const price = area_sqft * (projectType === ProjectType.VILLA ? 8000 : 5000);

        await ProjectUnit.create({
            project_id: projectId,
            unit_number: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}01`,
            unit_type: unitType,
            floor_number: (i % 20) + 1,
            tower: `Tower ${String.fromCharCode(65 + (i % 3))}`,
            area_sqft: area_sqft,
            area_sqm: area_sqft * 0.092903,
            price: price,
            price_per_sqft: price / area_sqft,
            maintenance_charge: area_sqft * 3,
            parking_spaces: bedrooms >= 3 ? 2 : 1,
            balconies: bedrooms >= 2 ? 2 : 1,
            bathrooms: bedrooms,
            bedrooms: bedrooms,
            status: i === 0 ? UnitStatus.SOLD : (i === 1 ? UnitStatus.BLOCKED : UnitStatus.AVAILABLE),
            is_corner_unit: i % 4 === 0,
            has_terrace: i % 5 === 0,
            specifications: {
                flooring: 'Vitrified tiles',
                kitchen: 'Modular kitchen',
                bathroom: 'Premium fittings'
            },
            amenities: ['Balcony', 'Parking', 'Power Backup']
        });
    }
}
