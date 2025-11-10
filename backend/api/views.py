from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'status': 'success',
            'data': {
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)

    return Response({
        'status': 'error',
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response({
            'status': 'success',
            'data': serializer.validated_data
        })

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
