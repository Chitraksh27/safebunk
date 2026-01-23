from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        
    def validate_username(self, value):
        if User.objects.filter(username = value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'],
            password = validated_data['password'],
            email = validated_data.get('email', '')
        )
        return user