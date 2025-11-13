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


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    user = request.user
    data = request.data

    if 'name' in data:
        user.first_name = data.get('name', '').split(' ')[0]
        if len(data.get('name', '').split(' ')) > 1:
            user.last_name = ' '.join(data.get('name', '').split(' ')[1:])

    if 'email' in data:
        # Check if email already exists
        from django.contrib.auth.models import User
        if User.objects.filter(email=data['email']).exclude(id=user.id).exists():
            return Response({
                'status': 'error',
                'message': 'Email already in use'
            }, status=status.HTTP_400_BAD_REQUEST)
        user.email = data['email']

    user.save()

    return Response({
        'status': 'success',
        'data': {'user': UserSerializer(user).data},
        'message': 'Profile updated successfully'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not current_password or not new_password:
        return Response({
            'status': 'error',
            'message': 'Both current and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Verify current password
    if not user.check_password(current_password):
        return Response({
            'status': 'error',
            'message': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Validate new password
    if len(new_password) < 8:
        return Response({
            'status': 'error',
            'message': 'New password must be at least 8 characters'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response({
        'status': 'success',
        'message': 'Password changed successfully'
    })
