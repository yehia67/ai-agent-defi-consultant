import requests
import logging
import os


def lambda_handler(event, context):
        agent = event['agent']
        actionGroup = event['actionGroup']
        function = event['function']
        parameters = event.get('parameters', [])
        logging.warning(f"Received wallet_address: {parameters[0]["value"]}")

        wallet_address = parameters[0]["value"]

        url = f"https://api.sim.dune.com/v1/evm/transactions/{wallet_address}"
        headers = {"X-Sim-Api-Key": os.getenv("SIM_API_KEY")}

        
        response = requests.request("GET", url, headers=headers, timeout=30)

        response_body = {
            'TEXT': {
                'body':response.text
            }
        }
        
        function_response = {
            'actionGroup': event['actionGroup'],
            'function': event['function'],
            'functionResponse': {
                'responseBody': response_body
            }
        }
        
        session_attributes = event['sessionAttributes']
        prompt_session_attributes = event['promptSessionAttributes']
        
        action_response = {
            'messageVersion': '1.0', 
            'response': function_response,
            'sessionAttributes': session_attributes,
            'promptSessionAttributes': prompt_session_attributes
        }
            
        return action_response
