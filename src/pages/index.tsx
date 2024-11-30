// pages/index.js
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  // Navigate to Sign In page
  const handleSignInClick = () => {
    router.push("/Signin");
  };

  // Navigate to Sign Up page
  const handleSignUpClick = () => {
    router.push("/SignUp");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* App Introduction */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to YourFoodIsGood
          </h1>
          <p className="text-lg text-gray-600">
            Discover, share, and buy homemade food. Connect with food lovers in
            your community!
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="transition duration-200 ease-in-out transform hover:scale-105">
            <CardHeader>
              <CardTitle>Post Your Food</CardTitle>
              <CardDescription>
                Share your delicious creations with the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload pictures and get AI descriptions of your homemade dishes for
                others to explore.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="transition duration-200 ease-in-out transform hover:scale-105">
            <CardHeader>
              <CardTitle>Connect Through Comments</CardTitle>
              <CardDescription>
                Engage with food enthusiasts and potential buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share feedback, ask questions, and build connections with
                others who share your passion for food.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="transition duration-200 ease-in-out transform hover:scale-105">
            <CardHeader>
              <CardTitle>Buy & Enjoy</CardTitle>
              <CardDescription>
                Find homemade meals you’ll love.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 ">
                Browse posts, chat with sellers, and buy dishes directly from
                the app.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-lg text-gray-600">Ready to join the community?</p>
          <div className="flex justify-center gap-6">
            <Button
              onClick={handleSignInClick}
              className="bg-blue-600 text-white py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Sign In
            </Button>
            <Button
              onClick={handleSignUpClick}
              className="bg-green-600 text-white py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
