import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Template {
  id: string; 
  subject: string;
  message: string;
}

const EditMailTemplate = () => {
  const [, setTemplate] = useState<Template | null>(null); 
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const { id } = useParams<{ id: string }>(); 

  
  useEffect(() => {
    if (id) {
      const fetchTemplate = async () => {
        try {
          const response = await fetch(`/email-template/${id}`);
          const data = await response.json();

          if (data.success) {
            const fetchedTemplate: Template = data.template; 
            setTemplate(fetchedTemplate); 
            setSubject(fetchedTemplate.subject); 
            setMessage(fetchedTemplate.message); 
          } else {
            alert("Failed to fetch template data.");
          }
        } catch (error) {
          console.error("Error fetching template data:", error);
          alert("An error occurred while fetching the template.");
        }
      };

      fetchTemplate();
    }
  }, [id]);

  const handleSave = async () => {
    if (!id) {
      alert("Template ID is missing.");
      return;
    }

    const updatedTemplate: Template = { id, subject, message };

    try {
      const response = await fetch(`/email-template/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTemplate),
      });

      const result = await response.json();
      if (result.success) {
        alert("Template saved successfully!");
      } else {
        alert(`Failed to save template: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("An error occurred while saving the template.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader className="text-xl font-bold">Edit Mail Template</CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject:
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message:
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-500 text-white">
              Save
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>The following placeholders are allowed:</p>
            <ul className="list-disc list-inside">
              <li>
                <strong>%USERNAME%</strong> - Username for whom the mail will be sent
              </li>
              <li>
                <strong>%USERFULLNAME%</strong> - User's full name
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMailTemplate;
