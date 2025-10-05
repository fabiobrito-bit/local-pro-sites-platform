import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function ClientContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Beheer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Website Content Editor</CardTitle>
          <CardDescription>Bewerk de content van je website</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content editor wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
