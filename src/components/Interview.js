import { Box, Text } from 'ink'

export const Interview = () => {
    return (
        <Box flexDirection="column">
            <Box flexDirection="row">
                <Box width="25%" borderStyle="round" borderColor="green">
                    <Text>Question here</Text>
                </Box>
                <Box width="75%" borderStyle="round" borderColor="green">
                    <Text>Input area here</Text>
                </Box>
            </Box>
            <Box width="100%" borderStyle="round" borderColor="green">
                <Text>Chat history here</Text>
            </Box>
        </Box>
    )
}