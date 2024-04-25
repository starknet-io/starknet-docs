import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import java.net.HttpURLConnection
import java.net.URL
import java.io.OutputStreamWriter

def commentOnPullRequest(String apiUrl, String authToken, String owner, String repo, int pullRequestNumber, String comment) {
    try {
        // Construct the URL for the GitHub API endpoint
        def url = new URL("${apiUrl}/repos/${owner}/${repo}/issues/${pullRequestNumber}/comments")
        
        // Open connection
        def con = url.openConnection() as HttpURLConnection
        
        // Set request method and headers
        con.setRequestMethod("POST")
        con.setRequestProperty("Authorization", "token ${authToken}")
        con.setRequestProperty("Content-Type", "application/json")
        con.setDoOutput(true)
        
        // Construct JSON payload for the comment
        def payload = JsonOutput.toJson([body: comment])
        
        // Write payload to request body
        def writer = new OutputStreamWriter(con.getOutputStream())
        writer.write(payload)
        writer.flush()
        
        // Get response code
        int responseCode = con.getResponseCode()
        println("Response Code: ${responseCode}")
        
        // Read response body
        def response = con.getInputStream().getText()
        println("Response Body: ${response}")
        
        // Close connection
        con.disconnect()
    } catch (Exception e) {
        println("Exception occurred: ${e.getMessage()}")
    }
}

return this