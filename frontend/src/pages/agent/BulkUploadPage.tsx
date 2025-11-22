import { useState, useEffect } from 'react';
import { Layout } from '@/shared/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useAsyncOperation } from '@/shared/hooks/useAsyncOperation';

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
  const { handleError, showSuccess, showValidationError } = useErrorHandler();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [pollIntervalId, setPollIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, [pollIntervalId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showValidationError('Please select a valid CSV file', 'File Type');
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showValidationError('File size must be less than 10MB', 'File Size');
        return;
      }
      
      setSelectedFile(file);
      setUploadProgress(null);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const templateUrl = api.upload.downloadPropertyTemplate();
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = 'property_upload_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Template downloaded successfully');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to download template'), {
        context: { operation: 'download_template' }
      });
    }
  };

  // Create async operation for file upload
  const uploadOperation = useAsyncOperation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.upload.bulkPropertyCSV(formData);
      
      // Handle different response structures
      const responseData = response.data || response;
      const isSuccess = response.success || (responseData && responseData.success);
      const uploadId = responseData?.uploadId || response?.data?.uploadId;
      
      if (!isSuccess || !uploadId) {
        const errorMsg = 
          responseData?.error?.message || 
          responseData?.message || 
          response?.error?.message || 
          'Upload failed. Please try again.';
        throw new Error(errorMsg);
      }
      
      return { uploadId, responseData };
    },
    {
      onSuccess: ({ uploadId }) => {
        // Set initial processing state
        setUploadProgress(prev => ({
          ...prev!,
          uploadId: uploadId,
          status: 'processing',
          progress: 10
        }));
        
        // Start polling for progress updates
        pollProgress(uploadId);
      },
      onError: (error) => {
        setUploadProgress(null);
        handleError(error, {
          context: { operation: 'file_upload', fileName: selectedFile?.name }
        });
      },
      showErrorToast: true,
      errorMessage: 'Failed to upload file. Please try again.'
    }
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      showValidationError('Please select a file to upload', 'File Selection');
      return;
    }

    // Set initial progress state
    setUploadProgress({
      status: 'pending',
      progress: 5,
      processedRows: 0,
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      uploadId: '',
    });

    await uploadOperation.execute(selectedFile);
  };

  const pollProgress = (uploadId: string) => {
    // Clear any existing polling interval
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
    }

    const intervalId = setInterval(async () => {
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

        // Handle completion or failure
        if (progressData.status === 'completed' || progressData.status === 'failed') {
          clearInterval(intervalId);
          setPollIntervalId(null);
          
          if (progressData.status === 'completed') {
            showSuccess(
              `Upload completed successfully! ${progressData.successfulRows} properties processed.`,
              progressData.failedRows > 0 
                ? `${progressData.failedRows} rows had errors. Check the error report for details.`
                : undefined
            );
          } else if (progressData.status === 'failed') {
            handleError(new Error('Processing failed. Please check the error report.'), {
              context: { 
                operation: 'file_processing', 
                uploadId,
                processedRows: progressData.processedRows,
                totalRows: progressData.totalRows
              }
            });
          }
        }
      } catch (err) {
        clearInterval(intervalId);
        setPollIntervalId(null);
        
        handleError(err instanceof Error ? err : new Error('Failed to get upload progress'), {
          context: { 
            operation: 'progress_polling', 
            uploadId 
          }
        });
      }
    }, 2000); // Poll every 2 seconds

    setPollIntervalId(intervalId);
  };

  const handleDownloadErrorReport = () => {
    if (!uploadProgress?.uploadId) {
      showValidationError('No error report available', 'Download Error');
      return;
    }

    try {
      const reportUrl = api.upload.getReportUri(uploadProgress.uploadId);
      window.open(reportUrl, '_blank');
      showSuccess('Error report downloaded successfully');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to download error report'), {
        context: { 
          operation: 'download_error_report', 
          uploadId: uploadProgress.uploadId 
        }
      });
    }
  };

  const handleReset = () => {
    // Clear any ongoing polling
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }
    
    // Cancel any ongoing upload operation
    uploadOperation.cancel();
    
    // Reset state
    setSelectedFile(null);
    setUploadProgress(null);
    uploadOperation.reset();
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
                        disabled={uploadOperation.loading}
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
                        disabled={uploadOperation.loading}
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

                {/* Upload Error Alert - Only show if there's an upload operation error and no progress */}
                {uploadOperation.isError && !uploadProgress && (
                  <Alert variant="destructive">
                    <Icon icon="solar:danger-circle-bold" className="size-4" />
                    <AlertDescription>
                      Upload failed. Please check your file and try again.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={getStatusIcon(uploadProgress.status)}
                            className={`size-5 ${getStatusColor(uploadProgress.status)} ${
                              uploadProgress.status === 'processing' || uploadProgress.status === 'pending' ? 'animate-spin' : ''
                            }`}
                          />
                          <span className="font-medium capitalize">
                            {uploadProgress.status === 'pending' ? 'Initializing' : 
                             uploadProgress.status === 'processing' ? 'Processing' :
                             uploadProgress.status}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {uploadProgress.processedRows} / {uploadProgress.totalRows} rows
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={uploadProgress.progress || 0} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{uploadProgress.progress || 0}% complete</span>
                          {uploadProgress.totalRows > 0 && (
                            <span>
                              {uploadProgress.status === 'processing' ? 'Processing...' : 
                               uploadProgress.status === 'pending' ? 'Starting...' : 
                               'Complete'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

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
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <Icon icon="solar:danger-circle-bold" className="size-4" />
                          <AlertDescription>
                            The upload process failed. Please check the error report for details.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadProgress(null);
                              handleUpload();
                            }}
                            disabled={uploadOperation.loading}
                          >
                            <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
                            Retry Upload
                          </Button>
                          
                          {uploadProgress.hasErrorReport && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadErrorReport}
                            >
                              <Icon icon="solar:download-bold" className="size-4 mr-2" />
                              Download Error Report
                            </Button>
                          )}
                        </div>
                      </div>
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
                        disabled={!selectedFile || uploadOperation.loading}
                        className="flex-1"
                      >
                        {uploadOperation.loading ? (
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
                        disabled={uploadOperation.loading}
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