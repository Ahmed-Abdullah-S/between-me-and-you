import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">404 - الصفحة غير موجودة</h1>
                <p className="text-sm text-muted-foreground">
                  عذراً، الصفحة التي تبحث عنها غير موجودة.
                </p>
              </div>
              <Link href="/">
                <Button className="mt-4">
                  <HomeIcon className="ml-2 h-4 w-4" />
                  العودة للصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
