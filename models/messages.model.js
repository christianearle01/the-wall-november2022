const Mysql = require('mysql');
const EJS = require('ejs');
const Path = require('path');

const DatabaseModel = require('./database.model');

class MessagesModel extends DatabaseModel {

    constructor(){
        super();
    }

    /* Function to fetch the messages and comments */
    fetchMessagesAndComments = async () =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            let fetch_message_query = Mysql.format(`
                SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', derived_messages_comments_table.message_id, 
                            'name', derived_messages_comments_table.message_name,
                            'content', derived_messages_comments_table.message_content,
                            'comments_data', derived_messages_comments_table.comments_data,
                            'created_at', derived_messages_comments_table.message_created_at
                        )
                    ) AS messages_data
                FROM 
                (
                    SELECT 
                        derived_messages_table.*, 
                        JSON_ARRAYAGG( 
                            JSON_OBJECT(
                                'id', comments.id,
                                'message_id', comments.message_id,
                                'name', CONCAT(users.first_name, ' ', users.last_name),
                                'content', comments.content, 
                                'created_at', DATE_FORMAT(comments.created_at, '%Y-%b-%e %H:%i:%s')
                            )
                        )
                        AS comments_data
                    FROM
                    (
                        SELECT 
                            messages.id AS message_id, 
                            CONCAT(users.first_name, ' ', users.last_name) AS message_name,
                            messages.content AS message_content, 
                            DATE_FORMAT(messages.created_at, '%Y-%b-%e %H:%i:%s') AS message_created_at
                        FROM messages
                        INNER JOIN users
                            ON users.id = messages.user_id
                    ) AS derived_messages_table
                    LEFT JOIN comments
                        ON comments.message_id = derived_messages_table.message_id
                    LEFT JOIN users
                        ON users.id = comments.user_id
                    GROUP BY derived_messages_table.message_id
                ) AS derived_messages_comments_table
            `);

            response_data = await this.executeQuery(fetch_message_query);

        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to fetch the messages and comment.";
        }

        return response_data;
    }
    /* Function to post a message */
    postMessage = async (params) =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            let post_message_query = Mysql.format(`INSERT INTO messages (user_id, content, created_at, updated_at) VALUES(?, ?, NOW(), NOW());`, Object.values(params));
            let post_message_response = await this.executeQuery(post_message_query);
            let insert_id = post_message_response.result?.insertId;

            if(insert_id){
                let fetch_message_query = Mysql.format(`SELECT DATE_FORMAT(created_at, '%Y-%b-%e %H:%i:%s') AS message_created_at FROM messages WHERE id = ?`, [insert_id]);
                let { result: [{message_created_at}] } = await this.executeQuery(fetch_message_query);
                response_data = post_message_response;

                let message_data = {
                    id: insert_id,
                    user_id: params.user_id,
                    content: params.content,
                    created_at: message_created_at
                }

                /* generate partial html for message */
                response_data.html = await EJS.renderFile(Path.join(__dirname, "../views/partials/message_comments.ejs"), { message_data }, { async: true });
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to post a message.";
        }

        return response_data;
    }
    
    /* Function to delete a message and its comments */
    deleteMessage = async (params) =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            let delete_comments_query = Mysql.format(`DELETE FROM comments WHERE message_id = ?;`, [params.message_id]);
            await this.executeQuery(delete_comments_query);

            let delete_message_query = Mysql.format(`DELETE FROM messages WHERE id = ? AND user_id = ?;`, Object.values(params));
            response_data = await this.executeQuery(delete_message_query);
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to delete a message.";
        }

        return response_data;
    }
}

module.exports = MessagesModel;