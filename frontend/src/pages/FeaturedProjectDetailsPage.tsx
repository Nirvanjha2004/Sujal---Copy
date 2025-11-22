import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Layout } from "@/shared/components/layout/Layout";
import { Icon } from "@iconify/react";
import { getS3ImageUrl } from "@/shared/utils/s3ImageUtils";

// Mock data for the 4 featured projects with images
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
    listing_type: 'New Launch / Under Construction',
    status: 'under_construction',
    pricing: '₹1.25 Cr - ₹1.95 Cr',
    bedrooms: '3 BHK + Servant',
    area: '1521.29 sq ft & 1547.43 sq ft carpet area',
    amenities: [
      'Swimming Pool', 'Gym', 'Clubhouse', 'Children Play Area',
      'Landscaped Gardens', 'Security', '24/7 Power Backup', 'Parking',
      'Jogging Track', 'Indoor Games', 'Party Hall', 'CCTV Surveillance'
    ],
    images: [
      '/landingpage/ProjectImages/shalimar/c1.jpg',
      '/landingpage/ProjectImages/shalimar/C_13.jpg',
      '/landingpage/ProjectImages/shalimar/c12 (4).jpg',
      '/landingpage/ProjectImages/shalimar/c13 (2).jpg',
      '/landingpage/ProjectImages/shalimar/c13-1.jpg',
      '/landingpage/ProjectImages/shalimar/c2 (1).jpg',
      '/landingpage/ProjectImages/shalimar/C4 (3).jpg',
      '/landingpage/ProjectImages/shalimar/c9 (3).jpg',
      '/landingpage/ProjectImages/shalimar/CLUB MULTIPURPOSE HALL REV..png',
      '/landingpage/ProjectImages/shalimar/ENTRANCE LOBBY.jpg'
    ],
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
    images: [
      '/landingpage/ProjectImages/Casagrand/Copy of Casamia - online creative-10.jpg',
      '/landingpage/ProjectImages/Casagrand/Copy of casamia online 2_nri-4.jpg',
      '/landingpage/ProjectImages/Casagrand/Copy of Casamia_Online_Nri-01.jpg',
      '/landingpage/ProjectImages/Casagrand/Copy of Casamia_Online_Nri-08.jpg',
      '/landingpage/ProjectImages/Casagrand/Copy of csamia online 1_nri-3.jpg',
      '/landingpage/ProjectImages/Casagrand/ENTRANCE LOBBY.jpg',
      '/landingpage/ProjectImages/Casagrand/Screenshot 2025-11-17 213748.jpg',
      '/landingpage/ProjectImages/Casagrand/Screenshot 2025-11-17 213806.jpg',
      '/landingpage/ProjectImages/Casagrand/Screenshot 2025-11-17 213824.jpg'
    ],
    rera_number: 'TN/35/Building/0053/2024',
    rera_promoter: 'TN/35/Promoter/0053/2024'
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
    bedrooms: '3 & 4 BHK units',
    area: 'Super built-up area for 4 BHK flats starts from 4,400 square feet',
    amenities: ['All basic amenities'],
    images: [
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0002.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0004.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0005.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0006.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0007.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0008.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0009.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0010.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0011.jpg',
      '/landingpage/ProjectImages/DSRVALAR/DSR Valar Brochure _page-0012.jpg'
    ],
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
    area: '2 BHK: 883 sq ft carpet + 150 sq ft balcony | 2.5 BHK: 1086 sq ft + 157 sq ft | 3 BHK-A: 1086 sq ft + 184 sq ft | 3 BHK-B: 1175 sq ft + 184 sq ft | 3.5 BHK: 1250 sq ft + 162 sq ft | 4.5 BHK: 2250 sq ft + 211 sq ft',
    amenities: ['All basic amenities'],
    images: [
      'projects/Amanora/Gateway II Main Brochure Final_page-0005.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0006.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0007.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0008.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0009.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0010.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0011.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0012.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0013.jpg',
      'projects/Amanora/Gateway II Main Brochure Final_page-0015.jpg'
    ],
    rera_number: 'P52100079477, PR12610125006749',
    rera_promoter: 'PR12610125006749'
  }
};



export function FeaturedProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [prefetchedImages, setPrefetchedImages] = useState<Set<number>>(new Set());

  const project = id ? FEATURED_PROJECTS[id as keyof typeof FEATURED_PROJECTS] : null;

  // Prefetch next/previous images when lightbox is open
  useEffect(() => {
    if (!isLightboxOpen || !project?.images) return;

    const prefetchImage = (index: number) => {
      if (prefetchedImages.has(index)) return;
      
      const img = new Image();
      img.src = getS3ImageUrl(project.images[index]);
      setPrefetchedImages(prev => new Set(prev).add(index));
    };

    // Prefetch next and previous images
    const nextIndex = (selectedImageIndex + 1) % project.images.length;
    const prevIndex = (selectedImageIndex - 1 + project.images.length) % project.images.length;
    
    prefetchImage(nextIndex);
    prefetchImage(prevIndex);
  }, [isLightboxOpen, selectedImageIndex, project, prefetchedImages]);

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



        {/* Image Gallery - Grid Layout */}
        {project.images && project.images.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Project Gallery</h2>
              <span className="text-sm text-muted-foreground">{project.images.length} Photos</span>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setIsLightboxOpen(true);
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-primary transition-all group"
                >
                  <img
                    src={getS3ImageUrl(image)}
                    alt={`${project.name} - Image ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none">
                    <Icon icon="solar:eye-bold" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {isLightboxOpen && project.images && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10"
            >
              <Icon icon="solar:close-circle-bold" className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-white/10 text-white px-4 py-2 rounded-full text-sm z-10">
              {selectedImageIndex + 1} / {project.images.length}
            </div>

            {/* Previous Button */}
            {project.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-10"
              >
                <Icon icon="solar:arrow-left-bold" className="h-8 w-8" />
              </button>
            )}

            {/* Main Image */}
            <div 
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getS3ImageUrl(project.images[selectedImageIndex])}
                alt={`${project.name} - Image ${selectedImageIndex + 1}`}
                loading="eager"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Next Button */}
            {project.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev === project.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-10"
              >
                <Icon icon="solar:arrow-right-bold" className="h-8 w-8" />
              </button>
            )}

            {/* Thumbnail Strip at Bottom */}
            {project.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4">
                <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                  {project.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={getS3ImageUrl(image)}
                        alt={`Thumbnail ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
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
