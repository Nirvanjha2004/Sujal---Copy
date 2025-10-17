import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';
import { useNavigate } from 'react-router-dom';

interface UploadProgress {
  uploadId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // Make progress optional as it might not exist initially
  processedRows: number;
  totalRows: number;
  successfulRows: number; // Use successfulRows from backend
  failedRows: number; // Use failedRows from backend
  errors?: Array<{ row: number; field: string; message: string }>;
  hasErrorReport?: boolean;
}

export function BulkUploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadProgress(null);
    }
  };

  const handleDownloadTemplate = () => {
    const templateUrl = api.upload.downloadPropertyTemplate();
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'property_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    
    // Set initial progress
    setUploadProgress({
      status: 'pending',
      progress: 5,
      processedRows: 0,
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      uploadId: '',
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Log what we're sending
      console.log('Uploading file:', selectedFile.name, selectedFile.size);

      const response = await api.upload.bulkPropertyCSV(formData);
      
      // Log the response to help debug
      console.log('Upload response:', JSON.stringify(response, null, 2));

      // The response might be directly the data object if using axios or fetch with auto-parsing
      // Check both structures to handle either case
      const responseData = response.data || response;
      const isSuccess = response.success || (responseData && responseData.success);
      const uploadId = responseData?.uploadId || response?.data?.uploadId;
      
      if (isSuccess && uploadId) {
        // Update with actual uploadId from response
        setUploadProgress(prev => ({
          ...prev!,
          uploadId: uploadId,
          status: 'processing',
          progress: 10
        }));
        
        // Start polling for progress updates
        pollProgress(uploadId);
      } else {
        // Error handling for API errors
        const errorMsg = 
          responseData?.error?.message || 
          responseData?.message || 
          response?.error?.message || 
          'Upload failed. Please try again.';
        
        setError(errorMsg);
        setUploading(false);
        setUploadProgress(null);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Enhanced error extraction from various possible structures
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        err.message || 
        'Failed to upload file. Please check your network connection.';
      
      setError(errorMessage);
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const pollProgress = (uploadId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const progressResponse = await api.upload.getProgress(uploadId);
        const progressData = progressResponse.data;

        const newProgress: UploadProgress = {
          uploadId: progressData.uploadId,
          status: progressData.status,
          processedRows: progressData.processedRows,
          totalRows: progressData.totalRows,
          successfulRows: progressData.successfulRows,
          failedRows: progressData.failedRows,
          hasErrorReport: progressData.hasErrorReport,
          // Calculate percentage progress
          progress: progressData.totalRows > 0 ? Math.round((progressData.processedRows / progressData.totalRows) * 100) : 0,
        };

        setUploadProgress(newProgress);

        if (progressData.status === 'completed' || progressData.status === 'failed') {
          clearInterval(pollInterval);
          setUploading(false);
          // If the process failed, you might want to fetch the error details
          if(progressData.status === 'failed' && !error) {
            setError("Processing failed. Please check the error report.");
          }
        }
      } catch (err) {
        console.error('Error polling progress:', err);
        clearInterval(pollInterval);
        setUploading(false);
        setError('Failed to get upload progress.');
      }
    }, 2000); // Polling every 2 seconds is safer
  };

  const handleDownloadErrorReport = () => {
    if (uploadProgress?.uploadId) {
      const reportUrl = api.upload.getReportUri(uploadProgress.uploadId);
      window.open(reportUrl, '_blank');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setError(null);
    setUploading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed': // Changed from 'error'
        return 'text-red-600';
      case 'processing':
      case 'pending': // Changed from 'uploading'
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'solar:check-circle-bold';
      case 'failed': // Changed from 'error'
        return 'solar:close-circle-bold';
      case 'processing':
      case 'pending': // Changed from 'uploading'
        return 'solar:refresh-bold';
      default:
        return 'solar:document-bold';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
                Bulk Property Upload
              </h1>
              <p className="text-muted-foreground">
                Upload multiple properties at once using CSV file
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/my-properties')}>
              <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
              Back to Properties
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="solar:upload-bold" className="size-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select a CSV file containing property data to upload
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Selection */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Icon
                    icon="solar:file-bold"
                    className="size-12 text-muted-foreground mx-auto mb-4"
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        disabled={uploading}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2 text-muted-foreground">
                        Click to select or drag and drop your CSV file
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild>
                          <span>
                            <Icon icon="solar:upload-bold" className="size-4 mr-2" />
                            Select CSV File
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* Error Alert */}
                {error && !uploadProgress && (
                  <Alert variant="destructive">
                    <Icon icon="solar:danger-circle-bold" className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon={getStatusIcon(uploadProgress.status)}
                          className={`size-5 ${getStatusColor(uploadProgress.status)} ${
                            uploadProgress.status === 'processing' || uploadProgress.status === 'pending' ? 'animate-spin' : ''
                          }`}
                        />
                        <span className="font-medium capitalize">
                          {uploadProgress.status}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {uploadProgress.processedRows} / {uploadProgress.totalRows} rows
                      </span>
                    </div>
                    <Progress value={uploadProgress.progress} />

                    {uploadProgress.status === 'completed' && (
                      <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <Icon icon="solar:check-circle-bold" className="size-6 text-green-600 mr-3" />
                            <h3 className="font-medium text-lg">Upload Completed Successfully</h3>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-2">
                              <span className="text-muted-foreground">Total rows processed:</span>
                              <span className="font-medium">{uploadProgress.totalRows}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-2">
                              <span className="text-muted-foreground">Successfully added properties:</span>
                              <span className="font-medium text-green-600">{uploadProgress.successfulRows}</span>
                            </div>
                            {uploadProgress.failedRows > 0 && (
                              <div className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-2">
                                <span className="text-muted-foreground">Failed rows:</span>
                                <span className="font-medium text-red-600">{uploadProgress.failedRows}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Upload ID:</span>
                              <span className="font-mono text-xs">{uploadProgress.uploadId.substring(0, 8)}...</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <Button 
                              variant="default" 
                              className="flex-1"
                              onClick={() => navigate('/my-properties')}
                            >
                              <Icon icon="solar:list-bold" className="size-4 mr-2" />
                              View Properties
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleReset}
                            >
                              <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                              Upload Another File
                            </Button>
                          </div>
                        </div>
                        
                        {uploadProgress.hasErrorReport && (
                          <Alert variant="warning">
                            <Icon icon="solar:warning-bold" className="size-4" />
                            <AlertDescription>
                              Some rows had errors. Download the error report for details.
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-1 h-auto p-0 text-amber-700"
                                onClick={handleDownloadErrorReport}
                              >
                                <Icon icon="solar:download-bold" className="size-4 mr-1" />
                                Download Error Report
                              </Button>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    
                    {uploadProgress.status === 'failed' && (
                       <Alert variant="destructive">
                        <Icon icon="solar:danger-circle-bold" className="size-4" />
                        <AlertDescription>
                          The upload process failed. Please check the error report.
                        </AlertDescription>
                      </Alert>
                    )}

                    {uploadProgress.hasErrorReport && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadErrorReport}
                        >
                          <Icon icon="solar:download-bold" className="size-4 mr-2" />
                          Download Error Report
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!uploadProgress || uploadProgress.status === 'failed' ? (
                    <>
                      <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="flex-1"
                      >
                        {uploading ? (
                          <>
                            <Icon
                              icon="solar:refresh-bold"
                              className="size-4 mr-2 animate-spin"
                            />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:upload-bold" className="size-4 mr-2" />
                            Upload Properties
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={uploading}
                      >
                        Reset
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleReset} className="flex-1">
                      <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                      Upload Another File
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="solar:info-circle-bold" className="size-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Download Template</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download the CSV template with required fields
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                  >
                    <Icon icon="solar:download-bold" className="size-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Fill Property Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Add your property details to the template. Make sure to
                    include all required fields.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Upload CSV</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload the completed CSV file and wait for processing to
                    complete.
                  </p>
                </div>

                <Alert>
                  <Icon icon="solar:lightbulb-bold" className="size-4" />
                  <AlertDescription className="text-sm">
                    <strong>Tip:</strong> You can upload up to 1000 properties
                    at once. Larger files will be processed in batches.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Property Type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Listing Type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Price</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Address, City, State</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Bedrooms, Bathrooms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <span>Area (sq ft)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}