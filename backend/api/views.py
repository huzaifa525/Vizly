from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
import logging
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

logger = logging.getLogger('api')


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/h', method='POST')
def register(request):
    """Register a new user"""
    logger.info(f'Registration attempt from IP {request.META.get("REMOTE_ADDR")}')

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        logger.info(f'User {user.email} registered successfully')
        return Response({
            'status': 'success',
            'data': {
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)

    logger.warning(f'Registration failed from IP {request.META.get("REMOTE_ADDR")}: {serializer.errors}')
    return Response({
        'status': 'error',
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST')
def login(request):
    """Login user"""
    email = request.data.get('email', 'unknown')
    logger.info(f'Login attempt for {email} from IP {request.META.get("REMOTE_ADDR")}')

    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        logger.info(f'User {email} logged in successfully')
        return Response({
            'status': 'success',
            'data': serializer.validated_data
        })

    logger.warning(f'Login failed for {email} from IP {request.META.get("REMOTE_ADDR")}')
    return Response({
        'status': 'error',
        'message': serializer.errors
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response({
        'status': 'success',
        'data': {'user': serializer.data}
    })
