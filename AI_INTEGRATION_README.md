# 🤖 AI Integration for Task Manager

This document explains how to set up and use the AI-powered insights feature in your Task Manager application.

## 🚀 Features

The AI integration provides:

- **Smart Priority Suggestions**: AI analyzes your tasks and suggests which ones to prioritize based on deadlines, importance, and workload
- **Weekly Progress Summary**: Natural language summary of your productivity patterns and progress
- **Risk Alerts**: Predicts which tasks are likely to be overdue and provides actionable recommendations
- **Real-time Analysis**: Fresh insights every time you refresh the dashboard

## 📋 Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use the AI features
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key in your account settings
   - The integration uses GPT-3.5-turbo for cost-effective analysis

2. **Environment Setup**: Add your API key to your environment variables

## ⚙️ Setup Instructions

### 1. Add Environment Variable

Create or update your `.env.local` file:

```bash
# Add this line to your existing .env.local file
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Install Dependencies

The required dependencies are already installed:

```bash
npm install openai
```

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## 🎯 How It Works

### API Route: `/api/ai/insights`

The AI integration consists of:

1. **Data Collection**: Fetches all tasks assigned to the current user
2. **AI Analysis**: Sends task data to OpenAI GPT-3.5-turbo for analysis
3. **Structured Response**: Returns insights in a consistent JSON format
4. **Error Handling**: Graceful fallbacks if AI service is unavailable

### Response Format

```json
{
  "suggested_priorities": [
    {
      "taskId": "task-uuid",
      "reason": "This task has an urgent deadline approaching"
    }
  ],
  "weekly_summary": "You've completed 3 tasks this week and have 2 high-priority items due soon.",
  "predicted_overdue": [
    {
      "taskId": "task-uuid", 
      "reason": "This task is at risk due to its deadline and current status"
    }
  ]
}
```

## 🎨 Dashboard Integration

The AI insights are displayed in three sections on the dashboard:

### 1. Suggested Priorities
- Shows top 3 tasks that should be prioritized
- Includes reasoning for each suggestion
- Direct links to view task details

### 2. Weekly Summary
- Natural language summary of progress
- Highlights productivity patterns
- Provides motivation and context

### 3. Risk Alerts
- Identifies tasks at risk of being overdue
- Explains why each task is flagged
- Helps prevent missed deadlines

## 🔧 Configuration Options

### AI Model Settings

You can modify the AI behavior in `src/app/api/ai/insights/route.ts`:

```typescript
// Change the model (default: gpt-3.5-turbo)
model: "gpt-4", // More accurate but more expensive

// Adjust creativity vs consistency (default: 0.3)
temperature: 0.1, // More consistent responses

// Control response length (default: 1000)
max_tokens: 1500, // Longer responses
```

### Cache Settings

Modify cache duration in `src/lib/ai-insights.ts`:

```typescript
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes instead of 5
```

## 🧪 Testing

### Run the Test Script

Test the AI integration with the provided script:

```bash
node test-ai-insights.js
```

This will:
1. Log in with test credentials
2. Call the AI insights API
3. Validate the response structure
4. Display sample results

### Manual Testing

1. **Create Test Data**: Add some tasks with different priorities and deadlines
2. **Check Dashboard**: Visit `/dashboard` to see AI insights
3. **Refresh Insights**: Click "Refresh Insights" to get new analysis
4. **Verify Results**: Check that suggestions make sense for your data

## 💡 Best Practices

### For Better AI Insights

1. **Add Deadlines**: Tasks with deadlines get better priority analysis
2. **Use Descriptions**: Detailed task descriptions help AI understand context
3. **Set Priorities**: Explicit priority levels improve suggestions
4. **Regular Updates**: Keep task statuses current for accurate analysis

### Performance Optimization

1. **Caching**: Insights are cached for 5 minutes to reduce API calls
2. **Error Handling**: Graceful fallbacks if AI service is down
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Cost Management**: Monitor OpenAI API usage and costs

## 🔒 Security Considerations

1. **API Key Protection**: Never commit your OpenAI API key to version control
2. **User Data**: Only user's own tasks are sent to AI for analysis
3. **Data Sanitization**: Task data is cleaned before sending to AI
4. **Authentication**: All AI endpoints require valid JWT authentication

## 🚨 Troubleshooting

### Common Issues

1. **"Unable to generate AI insights"**
   - Check your OpenAI API key is correct
   - Verify the key has sufficient credits
   - Ensure the key is properly set in `.env.local`

2. **"No tasks found"**
   - Create some tasks first
   - Make sure tasks are assigned to the current user
   - Check task visibility permissions

3. **"AI analysis temporarily unavailable"**
   - OpenAI service might be down
   - Check your internet connection
   - Try refreshing the insights later

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
DEBUG=ai-insights
```

## 📊 Cost Estimation

### OpenAI API Costs (GPT-3.5-turbo)

- **Input tokens**: ~500-1000 per analysis (depending on task count)
- **Output tokens**: ~200-400 per response
- **Estimated cost**: $0.001-0.003 per analysis
- **Monthly cost**: ~$0.03-0.09 for daily usage

### Cost Optimization

1. **Cache Results**: 5-minute cache reduces API calls
2. **Limit Analysis**: Only analyze when needed
3. **Monitor Usage**: Track API usage in OpenAI dashboard
4. **Consider Alternatives**: Use cheaper models for basic analysis

## 🔮 Future Enhancements

Potential improvements for the AI integration:

1. **Custom Prompts**: Allow users to customize AI analysis focus
2. **Historical Analysis**: Track productivity trends over time
3. **Team Insights**: Analyze team-wide productivity patterns
4. **Smart Notifications**: Proactive alerts for urgent tasks
5. **Integration APIs**: Connect with external productivity tools

## 📞 Support

If you encounter issues with the AI integration:

1. Check the troubleshooting section above
2. Verify your OpenAI API key and credits
3. Test with the provided test script
4. Review the console logs for error details

---

**Note**: The AI integration requires an active internet connection and valid OpenAI API credentials to function properly.
