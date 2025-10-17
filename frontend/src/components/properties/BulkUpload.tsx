import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/shared/lib/api';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, XCircle, UploadCloud, File as FileIcon } from 'lucide-react';

interface UploadProgress {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  hasErrorReport: boolean;
}

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setUploadProgress(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setError(null);
      const response = await api.upload.bulkPropertyCSV(formData);

      const { data } = response;
      setUploadId(data.uploadId);
      pollProgress(data.uploadId);

    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData && errorData.error?.code === 'INVALID_CSV_FORMAT') {
        setError(`Invalid CSV format: ${errorData.error.message}. Missing columns: ${errorData.error.details?.missingColumns?.join(', ')}`);
      } else {
        setError(errorData?.error?.message || 'An error occurred during upload.');
      }
    }
  };

  const pollProgress = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.upload.getProgress(id);
        const progressData = data;
        setUploadProgress(progressData);

        if (progressData.status === 'completed' || progressData.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to get upload progress.');
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleDownloadReport = () => {
    if (uploadId) {
      window.open(api.upload.getReportUri(uploadId), '_blank');
    }
  };

  const progressPercentage = uploadProgress
    ? (uploadProgress.processedRows / uploadProgress.totalRows) * 100
    : 0;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Bulk Property Upload</h1>
      
      <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        {file ? (
          <div className="mt-4 flex items-center justify-center">
            <FileIcon className="h-6 w-6 text-gray-500" />
            <p className="ml-2">{file.name}</p>
          </div>
        ) : (
          <p className="mt-2">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop a .csv file here, or click to select a file'}
          </p>
        )}
      </div>

      {file && (
        <div className="mt-4 text-center">
          <Button onClick={handleUpload} disabled={!!uploadProgress && uploadProgress.status === 'processing'}>
            {uploadProgress && uploadProgress.status === 'processing' ? 'Uploading...' : 'Start Upload'}
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadProgress && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Upload Progress</h2>
          <div className="mt-2 p-4 border rounded-lg">
            <p>Status: <span className="font-medium">{uploadProgress.status}</span></p>
            <p>Processed: {uploadProgress.processedRows} / {uploadProgress.totalRows}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{Math.round(progressPercentage)}% complete</p>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Successful: {uploadProgress.successfulRows}</span>
                </div>
                <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span>Failed: {uploadProgress.failedRows}</span>
                </div>
            </div>

            {uploadProgress.status === 'completed' && (
              <Alert className="mt-4" variant={uploadProgress.failedRows > 0 ? "default" : "default"}>
                <AlertTitle>
                  {uploadProgress.failedRows > 0 ? 'Upload Completed with Errors' : 'Upload Completed Successfully!'}
                </AlertTitle>
                <AlertDescription>
                  {uploadProgress.failedRows > 0 
                    ? `The upload finished, but ${uploadProgress.failedRows} rows could not be imported.`
                    : 'All properties were imported successfully.'
                  }
                </AlertDescription>
                {uploadProgress.hasErrorReport && (
                  <div className="mt-4">
                    <Button onClick={handleDownloadReport}>Download Error Report</Button>
                  </div>
                )}
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
