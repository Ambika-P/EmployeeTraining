import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, Share2, Calendar, FileText } from "lucide-react";

export default function Certificates() {
  const { user } = useAuth();

  const { data: certificates = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/certificates-user"],
    enabled: !!user,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Certificates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and manage your earned certificates
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <p className="mt-4 text-slate-500 dark:text-slate-400">Loading certificates...</p>
              </div>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4">
                <div className="flex justify-center">
                  <Award className="h-12 w-12 text-amber-400" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center">{cert.course.title || "Course"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span>Issue Date:</span>
                    </div>
                    <span className="font-medium">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-slate-400 mr-2" />
                      <span>Certificate ID:</span>
                    </div>
                    <span className="font-medium">{cert.certificateId || cert.id}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-4">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <a
                  href={`/public/certificate/${cert.certificateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  View Certificate
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
        )}

        {certificates.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Award className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Certificates Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Complete courses to earn certificates that showcase your skills and achievements.
            </p>
            <Button>Browse Courses</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
