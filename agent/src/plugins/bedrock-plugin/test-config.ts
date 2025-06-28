// test-bedrock-config.ts
import { configSchema } from './config';
import { BedrockService } from './service';

async function testConfig() {
    console.log('*** Testing AWS Bedrock configuration ***');
    try {
        const config = await configSchema.parseAsync(process.env);
        console.log('✅ Config schema validation passed');
        
        // Test service validation
        const service = new BedrockService(null as any);
        console.log('✅ Bedrock service created');
    } catch (error) {
        console.error('❌ Configuration test failed:', error);
    }
}

testConfig();