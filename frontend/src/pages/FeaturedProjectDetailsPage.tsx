import { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Layout } from "@/shared/components/layout/Layout";
import { Icon } from "@iconify/react";

// Mock data for the 10 featured projects
const FEATURED_PROJECTS = {
  '1': {
    id: 1,
    name: 'Shalimar One World',
    developer: 'Shalimar Corp Ltd.',
    description: '4 towers, G+28 floors, 3 BHK + Servant units, only two units per floor. Premium residential project with modern amenities and excellent connectivity.',
    location: 'Gomti Nagar Extension',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'Titanium, Shalimar Corporate Park, Vibhuti Khand, Gomti Nagar',
    project_type: 'Residential Apartments',
    listing_type: 'New Launch / Under Construction (based on brochure positioning)',
    status: 'under_construction',
    pricing: '₹1.25 Cr - ₹1.95 Cr',
    bedrooms: '3 BHK + Servant',
    area: '1521.29 sq ft & 1547.43 sq ft carpet area',
    amenities: [
      'Swimming Pool', 'Gym', 'Clubhouse', 'Children Play Area',
      'Landscaped Gardens', 'Security', '24/7 Power Backup', 'Parking',
      'Jogging Track', 'Indoor Games', 'Party Hall', 'CCTV Surveillance'
    ],
    images: ['/landingpage/images/1.png'],
    rera_number: 'UPRERAPRJ858081/05/2024',
    rera_promoter: 'UPRERAPRM4092'
  },
  '2': {
    id: 2,
    name: 'Casagrand Suncity',
    developer: 'Casagrand Premier Builders Limited',
    description: '40-acre Roman-themed township with 1402 apartments (Phase 1), 2/3/4 BHK, 2B+G+36 floors, 130+ amenities, international mall, medical clinic inside community.',
    location: 'Kelambakkam-Vandalur Corridor',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'NPL Devi, New No: 111, Old No. 59, LB Road, Thiruvanmiyur',
    project_type: 'High-rise residential apartments',
    listing_type: 'New Launch / Under Construction',
    status: 'under_construction',
    pricing: '₹67 L to ₹1.48 Cr',
    bedrooms: '2, 3 & 4 BHK units',
    area: 'Unit areas vary by tower',
    amenities: [
      'Swimming Pool', 'Gym', 'Clubhouse', 'Sports Courts', 'Jogging Track',
      'Children Play Area', 'Landscaped Gardens', 'Security', '24/7 Power Backup',
      'Parking', 'Shopping Complex', 'School', 'Hospital', 'Amphitheater'
    ],
    images: ['/landingpage/images/2.png'],
    rera_number: 'TN/35/Building/0053/2024',
    rera_promoter: 'TN/35/Promoter/0053/2024'
  },
  '3': {
    id: 3,
    name: 'Casagrand Mercury',
    developer: 'Casagrand Premier Builders Limited',
    description: 'One-stop interior solution for woodwork, electrical fittings, washroom accessories, and home accessories',
    location: 'Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Not mentioned',
    project_type: 'Interior / Home Interiors',
    listing_type: 'Service offering',
    status: 'active_service',
    pricing: 'Starts from ₹1 crore and goes up to ₹3.43 crore',
    bedrooms: 'Interior / Home Interiors',
    area: 'Not specified',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/2.png'],
    rera_number: 'TN/29/Building/055/2024',
    rera_promoter: 'TN/29/Building/055/2024'
  },
  '4': {
    id: 4,
    name: 'Casagrand Casamia',
    developer: 'Casagrand Premier Builders Limited',
    description: '22-acre Spanish-themed residential community, 1314 apartments, 2B+G+18 floors, 2/3/4 BHK, 60+ amenities, lush landscape, clubhouse, pools, courtyards.',
    location: 'Pallavaram',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'NPL Devi, New No.111, Old No.59, LB Road, Thiruvanmiyur',
    project_type: 'Residential Apartments',
    listing_type: 'New Launch / Under Construction',
    status: 'under_construction',
    pricing: 'Between ₹63 lakh and ₹1.25 crore',
    bedrooms: '2, 3 & 4 BHK apartments',
    area: 'Areas not listed in sq ft table; only shown',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/2.png'],
    rera_number: 'TN/35/Building/0097/2025',
    rera_promoter: 'TN/35/Building/0097/2025'
  },
  '5': {
    id: 5,
    name: 'The Arena - Hiranandani Fortune City, Panvel',
    developer: 'Hiranandani Communities',
    description: 'Premium residential project inside Hiranandani Fortune City township at Panvel; features clubhouse, recreational amenities, landscaped zones, and modern lifestyle offerings.',
    location: 'Panvel',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    address: 'Hiranandani Business Park, Powai (as per brochure footer/contact)',
    project_type: 'Residential Apartments',
    listing_type: 'Under Construction / New Launch',
    status: 'under_construction',
    pricing: 'Luxurious 2, 3 & BHK & Office Space Starts from ₹1.74 All Inc',
    bedrooms: '2-3 BHK',
    area: '3 BHK: 870 sq. ft. and 1040 sq. ft. | 2 BHK: 723 sq. ft. (based on carpet area)',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/3.png'],
    rera_number: 'P52000080098 (Greenfield), P52000080195 (Arcadia), P52000080155 (Citadel)',
    rera_promoter: 'P52000080195'
  },
  '6': {
    id: 6,
    name: 'Golden Willows - Hiranandani Fortune City',
    developer: 'Hiranandani Communities',
    description: 'Residential project within Hiranandani Fortune City, Panvel, offering 2 BHK apartments, landscaped spaces, and lifestyle offerings.',
    location: 'Panvel',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    address: 'Hiranandani Business Park, Powai (from brochure location map)',
    project_type: 'Residential Apartments',
    listing_type: 'Under Construction / New Launch',
    status: 'under_construction',
    pricing: 'Approximately from ₹73.9 Lk, ₹1 up to 900 and ₹1.52 Crore',
    bedrooms: '2-BHK',
    area: '2 BHK apartments range from 723.9 sq. ft. up to 900 sq. ft.',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/3.png'],
    rera_number: 'Multiple blocks: P52000054615 (Lavender), P52000055578 (Jasmine), P52000055661 (Zenia)',
    rera_promoter: 'P52000055196'
  },
  '7': {
    id: 7,
    name: 'Empress Hill - Hiranandani Gardens, Powai',
    developer: 'Hiranandani Group',
    description: 'Luxury 3 & 4 BHK residences in Powai\'s landmark township with 3.5+ acres of landscaped zones, 35+ amenities (rooftop lifestyle, gyms, swimming pool, themed gardens, and wellness areas)',
    location: 'Powai',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Empress Hill, Hiranandani Gardens, Powai (as per brochure location reference)',
    project_type: 'Residential Apartments',
    listing_type: 'Under Construction (BMIC approved till 20 Dec 2024; final OC pending approval)',
    status: 'under_construction',
    pricing: 'Luxurious 3 & 4 BHK Starts at ₹5.60 Cr All Inc',
    bedrooms: '3 & 4 BHK residences',
    area: '10se sq Sq Ft (Carpet Area)',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/3.png'],
    rera_number: 'P51800052633 (Wings A, B, C, D)',
    rera_promoter: 'P51800052633'
  },
  '8': {
    id: 8,
    name: 'DSR Valar',
    developer: 'DSR Infrastructure Pvt. Ltd.',
    description: 'Premium residential apartment project offering 3 & 4 BHK homes with luxury amenities, landscaped spaces, clubhouse, swimming pool, and modern facilities.',
    location: 'Kokapet, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'No. 773, DSR Tranquil Towers, 100ft Road, Ayyappa Society, Madhapur',
    project_type: 'Residential Apartments',
    listing_type: 'Under Construction / New Launch',
    status: 'under_construction',
    pricing: 'Over ₹4 Crore',
    bedrooms: '3 & 4 BHK units (as shown in brochures)',
    area: 'The super built-up area for 4 BHK flats starts from 4,400 square feet',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/3.png'],
    rera_number: 'TS RERA: P02500067402',
    rera_promoter: 'P02500067402'
  },
  '9': {
    id: 9,
    name: 'Gateway Towers II',
    developer: 'Amanora Park Town / City Corp',
    description: 'Ultra-luxury high-rise residential towers offering 2, 2.5, 3, 3.5, 4.5 BHK & duplex units with premium finishes, digital locks, modular kitchens, AC bedrooms, branded fittings, and a full amenity zone including pools, courts, gardens, and clubhouse.',
    location: 'Amanora Park Town',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Mundhwa - Kharadi Rd, Amanora Park Town, Hadapsar, Pune, Maharashtra',
    project_type: 'Residential Apartments',
    listing_type: 'Under Construction / New Launch',
    status: 'under_construction',
    pricing: 'Starts from ₹2.18 Cr',
    bedrooms: '2, 2.5, 3, 3.5, 4.5 BHK & Duplex options',
    area: '2 BHK: 883 sq ft carpet + 150 sq ft balcony | 2.5 BHK: 1086 sq ft + 157 sq ft | 3 BHK-A: 1086 sq ft + 184 sq ft | 3 BHK-B: 1175 sq ft + 184 sq ft | 3.5 BHK: 1250 sq ft + 162 sq ft | 4.5 BHK: 2250 sq ft + 211 sq ft | 4.5 BHK: 1745 sq ft + 211 sq ft | 4.5 Duplex: 1810 sq ft + 280 sq ft | 4.5 Duplex: 2315 sq ft + 233 sq ft | 4.5 Duplex: 2315 sq ft',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/4.png'],
    rera_number: 'P52100079477, PR12610125006749',
    rera_promoter: 'PR12610125006749'
  },
  '10': {
    id: 10,
    name: 'Shalimar One World',
    developer: 'Shalimar Corp Ltd.',
    description: '4 towers, G+28 floors, 3 BHK + Servant units, only two units per floor. Inside Shalimar OneWorld township',
    location: 'Titanium, Shalimar Corporate Park, Vibhuti Khand, Gomti Nagar',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'Titanium, Shalimar Corporate Park, Vibhuti Khand, Gomti Nagar',
    project_type: 'Residential Apartments',
    listing_type: 'New Launch / Under Construction (based on brochure positioning)',
    status: 'under_construction',
    pricing: '4 2BHK apartment starts at ₹4.25 Cr, and a 3BHK apartment starts at ₹6.49 Cr. For the Shalimar One World Pinnacle, prices start at ₹8.49 Cr onwards',
    bedrooms: '3 BHK + Servant',
    area: '1521.29 sq ft & 1547.43 sq ft carpet area options',
    amenities: ['All basic amenities'],
    images: ['/landingpage/images/1.png'],
    rera_number: 'UPRERAPRJ858081/05/2024',
    rera_promoter: 'UPRERAPRM4092'
  }
};

export function FeaturedProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const project = id ? FEATURED_PROJECTS[id as keyof typeof FEATURED_PROJECTS] : null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready_to_move': return 'bg-green-500';
      case 'under_construction': return 'bg-yellow-500';
      case 'pre_launch': return 'bg-blue-500';
      case 'planning': return 'bg-gray-500';
      case 'active_service': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready_to_move': return 'Ready to Move';
      case 'under_construction': return 'Under Construction';
      case 'pre_launch': return 'Pre Launch';
      case 'planning': return 'Planning';
      case 'active_service': return 'Active Service';
      default: return status;
    }
  };

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <Icon icon="solar:danger-bold" className="h-4 w-4" />
            <AlertDescription>
              Project not found
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} className="mt-4">
            <Icon icon="solar:arrow-left-bold" className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Icon icon="solar:arrow-left-bold" className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon icon="solar:map-point-bold" className="h-4 w-4" />
                <span>{project.location}, {project.city}, {project.state}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getStatusColor(project.status)} text-white`}>
                  {getStatusText(project.status)}
                </Badge>
                <Badge variant="outline">
                  {project.project_type}
                </Badge>
                <Badge variant="secondary">
                  By {project.developer}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                {project.pricing}
              </div>
              <div className="text-sm text-muted-foreground">
                {project.bedrooms}
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <div className="mb-8 overflow-hidden">
            <div className="relative w-full h-[25rem] overflow-hidden rounded-lg">
              <img
                src={project.images[0]}
                alt={project.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-semibold mb-3">Project Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Developer:</span>
                            <span className="font-medium">{project.developer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Project Type:</span>
                            <span className="font-medium">{project.project_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Listing Type:</span>
                            <span className="font-medium">{project.listing_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Configuration:</span>
                            <span className="font-medium">{project.bedrooms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Area:</span>
                            <span className="font-medium">{project.area}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Location Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-medium text-right">{project.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">City:</span>
                            <span className="font-medium">{project.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">State:</span>
                            <span className="font-medium">{project.state}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RERA Information */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-3">RERA Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RERA Number:</span>
                          <span className="font-medium">{project.rera_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RERA Promoter:</span>
                          <span className="font-medium">{project.rera_promoter}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Price Range</div>
                        <div className="text-2xl font-bold text-primary">{project.pricing}</div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-1">Configuration</div>
                        <div className="font-semibold">{project.bedrooms}</div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-1">Area</div>
                        <div className="font-semibold">{project.area}</div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button className="w-full" size="lg">
                          <Icon icon="solar:phone-bold" className="mr-2 h-4 w-4" />
                          Contact Developer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                {project.amenities && project.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No amenities information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
