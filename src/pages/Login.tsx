
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedTransition from '../components/AnimatedTransition';

const Login = () => {
  const navigate = useNavigate();
  
  // Immediately redirect to explore page
  useEffect(() => {
    navigate('/explore');
  }, [navigate]);
  
  return (
    <AnimatedTransition>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <p>Redirecting to explore page...</p>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Login;
