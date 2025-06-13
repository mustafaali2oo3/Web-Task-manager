// app/workflow/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function WorkflowPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Workflow</h1>

      <Tabs defaultValue="step1" className="w-full">
        <TabsList>
          <TabsTrigger value="step1">Step 1</TabsTrigger>
          <TabsTrigger value="step2">Step 2</TabsTrigger>
          <TabsTrigger value="step3">Step 3</TabsTrigger>
        </TabsList>

        <Separator className="my-4" />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Data Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This step involves gathering all necessary input from users or external sources.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Here we analyze and process the data collected in the previous step.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Output & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Finally, we generate results and present them in a meaningful way.</p>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}
