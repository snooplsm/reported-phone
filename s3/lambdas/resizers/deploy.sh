#!/bin/bash

set -e  # Stop script if any command fails

# ✅ Step 1: Get AWS Account ID & Region
echo "🔹 Fetching AWS Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
REGION=$(aws configure get region)
if [[ -z "$REGION" ]]; then
  REGION="us-east-1"
fi

LAMBDA_FUNCTION_NAME="image-resizer"
ROLE_NAME="lambda-role"
API_NAME="ImageResizerAPI"

echo "✅ AWS Account ID: $ACCOUNT_ID"
echo "✅ AWS Region: $REGION"

# ✅ Upload Custom Sharp Layer to AWS Lambda
echo "🔹 Uploading Custom Sharp Layer..."

#!/bin/bash

LAYER_NAME="node-sharp-layer"

# ✅ Check if the layer already exists
EXISTING_LAYER_ARN=$(aws lambda list-layer-versions --layer-name "$LAYER_NAME" \
  --query "LayerVersions[0].LayerVersionArn" --output text 2>/dev/null || echo "NONE")

if [[ "$EXISTING_LAYER_ARN" == "NONE" ]]; then
  echo "🔹 No existing layer found. Publishing new layer..."
  
  # ✅ Publish the new layer
  LAYER_ARN=$(aws lambda publish-layer-version --layer-name "$LAYER_NAME" \
    --zip-file fileb://sharp-layer.zip \
    --compatible-runtimes nodejs20.x \
    --compatible-architectures x86_64 arm64 \
    --query "LayerVersionArn" --output text)

  echo "✅ Layer published successfully: $LAYER_ARN"
else
  echo "✅ Layer already exists: $EXISTING_LAYER_ARN"
  LAYER_ARN="$EXISTING_LAYER_ARN"
fi

# ✅ Now you can use $LAYER_ARN in further AWS Lambda updates
echo "🔹 Using Layer ARN: $LAYER_ARN"

echo "✅ Sharp Layer Uploaded: $LAYER_ARN"

# ✅ Step 2: Check if IAM Role Exists, Create if Missing
echo "🔹 Checking IAM Role..."
ROLE_EXISTS=$(aws iam get-role --role-name $ROLE_NAME --query "Role.RoleName" --output text 2>/dev/null || echo "NO")

if [[ "$ROLE_EXISTS" == "NO" ]]; then
    echo "❌ IAM Role does not exist. Creating..."
    TRUST_POLICY='{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": { "Service": "lambda.amazonaws.com" },
          "Action": "sts:AssumeRole"
        }
      ]
    }'

    aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document "$TRUST_POLICY"

    echo "✅ IAM Role Created: $ROLE_NAME"

    # Attach necessary policies
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

    echo "✅ IAM Policies Attached"
else
    echo "✅ IAM Role Exists: $ROLE_NAME"
fi

# ✅ Step 4: Check if Lambda Function Exists, Create if Missing
echo "🔹 Checking Lambda Function..."
LAMBDA_EXISTS=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --query "Configuration.FunctionName" --output text 2>/dev/null || echo "NO")

if [[ "$LAMBDA_EXISTS" == "NO" ]]; then
    echo "❌ Lambda function does not exist. Creating..."
    aws lambda create-function \
      --function-name $LAMBDA_FUNCTION_NAME \
      --runtime nodejs18.x \
      --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
      --handler index.handler \
      --zip-file fileb://lambda.zip \
      --layers "$LAYER_ARN"
    echo "✅ Lambda Function Created"
else
    echo "✅ Lambda Function Exists: $LAMBDA_FUNCTION_NAME"
    echo "🔹 Updating Lambda function..."
    aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://lambda.zip
    
    echo "🔹 Updating Lambda Layers..."
    aws lambda update-function-configuration \
      --function-name $LAMBDA_FUNCTION_NAME \
      --layers "$LAYER_ARN"
fi

# ✅ Step 3: Zip Lambda Function
echo "🔹 Zipping Lambda function..."
zip -r lambda.zip index.js node_modules package.json > /dev/null

# ✅ Step 4: Check if Lambda Function Exists, Create if Missing
echo "🔹 Checking Lambda Function..."
LAMBDA_EXISTS=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --query "Configuration.FunctionName" --output text 2>/dev/null || echo "NO")

if [[ "$LAMBDA_EXISTS" == "NO" ]]; then
    echo "❌ Lambda function does not exist. Creating..."
    aws lambda create-function \
      --function-name $LAMBDA_FUNCTION_NAME \
      --runtime nodejs18.x \
      --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
      --handler index.handler \
      --zip-file fileb://lambda.zip
    echo "✅ Lambda Function Created"
else
    echo "✅ Lambda Function Exists: $LAMBDA_FUNCTION_NAME"
    echo "🔹 Updating Lambda function..."
    aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://lambda.zip
fi

# ✅ Step 5: Check if API Gateway Exists or Create It
echo "🔹 Checking API Gateway..."
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text 2>/dev/null || echo "")

if [[ -z "$API_ID" ]]; then
    echo "✅ API Gateway does not exist. Creating..."
    API_ID=$(aws apigatewayv2 create-api \
      --name "$API_NAME" \
      --protocol-type HTTP \
      --query "ApiId" --output text)
    echo "✅ API Gateway Created: $API_ID"
else
    echo "✅ API Gateway Exists: $API_ID"
fi

# ✅ Step 6: Create API Integration (with PayloadFormatVersion)
echo "🔹 Creating API Integration..."
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri "arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$LAMBDA_FUNCTION_NAME" \
  --payload-format-version "2.0" \
  --query "IntegrationId" --output text 2>/dev/null || echo "")

if [[ -z "$INTEGRATION_ID" ]]; then
    echo "✅ Integration already exists, retrieving it..."
    INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id $API_ID --query "Items[0].IntegrationId" --output text)
else
    echo "✅ Integration Created: $INTEGRATION_ID"
fi

# ✅ Step 7: Create API Route with Correct Integration ID
echo "🔹 Creating API Route..."
ROUTE_EXISTS=$(aws apigatewayv2 get-routes --api-id $API_ID --query "Items[?RouteKey=='GET /resize'].RouteId" --output text 2>/dev/null || echo "")

if [[ -z "$ROUTE_EXISTS" ]]; then
    aws apigatewayv2 create-route \
      --api-id $API_ID \
      --route-key "GET /resize" \
      --target "integrations/$INTEGRATION_ID"
    echo "✅ Route Created"
else
    echo "✅ Route Already Exists"
fi

# ✅ Step 8: Deploy API Gateway
echo "🔹 Deploying API Gateway..."
STAGE_EXISTS=$(aws apigatewayv2 get-stages --api-id $API_ID --query "Items[?StageName=='prod'].StageName" --output text 2>/dev/null || echo "")

if [[ -z "$STAGE_EXISTS" ]]; then
    echo "✅ Creating API Gateway Stage..."
    aws apigatewayv2 create-stage \
      --api-id $API_ID \
      --stage-name prod \
      --auto-deploy
else
    echo "✅ Deleting and Recreating API Gateway Stage..."
    aws apigatewayv2 delete-stage --api-id $API_ID --stage-name prod
    aws apigatewayv2 create-stage \
      --api-id $API_ID \
      --stage-name prod \
      --auto-deploy
fi

# ✅ Step 9: Allow API Gateway to Invoke Lambda
echo "🔹 Allowing API Gateway to Invoke Lambda..."
PERMISSION_EXISTS=$(aws lambda get-policy --function-name $LAMBDA_FUNCTION_NAME --query "Policy" --output text 2>/dev/null || echo "")

if [[ -z "$PERMISSION_EXISTS" ]]; then
    aws lambda add-permission \
      --function-name $LAMBDA_FUNCTION_NAME \
      --statement-id apigateway-invoke \
      --action lambda:InvokeFunction \
      --principal apigateway.amazonaws.com \
      --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*"
    echo "✅ Permission Added"
else
    echo "✅ Permission Already Exists"
fi

# ✅ Step 10: Get API URL
API_URL=$(aws apigatewayv2 get-apis --query "Items[?ApiId=='$API_ID'].ApiEndpoint" --output text)
FINAL_URL="${API_URL}/resize"

echo "🎉 Deployment Complete!"
echo "🌎 API Gateway URL: $FINAL_URL"