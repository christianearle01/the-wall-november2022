const Mysql = require('mysql');
const EJS = require('ejs');
const Path = require('path');

const DatabaseModel = require('./database.model');

class CommentsModel extends DatabaseModel {

    constructor(){
        super();
    }
    
    /* Function to post a comment */
    postComment = async (params, name) =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            let post_comment_query = Mysql.format(`INSERT INTO comments (user_id, message_id, content, created_at, updated_at) VALUES(?, ?, ?, NOW(), NOW());`, Object.values(params));
            let post_comment_response = await this.executeQuery(post_comment_query);
            let insert_id = post_comment_response?.result?.insertId;

            if(insert_id){
                let fetch_comment_query = Mysql.format(`SELECT DATE_FORMAT(created_at, '%Y-%b-%e %H:%i:%s') AS comment_created_at FROM comments WHERE id = ?`, [insert_id]);
                let { result: [{comment_created_at}] } = await this.executeQuery(fetch_comment_query);
                response_data = post_comment_response;

                let comment_data = {
                    name,
                    id: insert_id,
                    user_id: params.user_id,
                    message_id: params.message_id,
                    content: params.content,
                    created_at: comment_created_at
                }

                /* generate partial html for comment */
                response_data.html = await EJS.renderFile(Path.join(__dirname, "../views/partials/comments.ejs"), { comment_data }, { async: true });
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to post a comment.";
        }

        return response_data;
    }
    
    /* Function to delete a comment */
    deleteComment = async (params) =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            let delete_comment_query = Mysql.format(`DELETE FROM comments WHERE id = ? AND user_id = ?;`, Object.values(params));
            response_data = await this.executeQuery(delete_comment_query);
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to delete a comment.";
        }

        return response_data;
    }
}

module.exports = CommentsModel;