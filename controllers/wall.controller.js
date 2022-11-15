
const { validateFields } = require('../helpers/index.helper');

const MessagesModel = require('../models/messages.model');
const CommentsModel = require('../models/comments.model');

class WallController {
    #req;
    #res;

    constructor(req, res){
        this.#req = req;
        this.#res = res;

        if(!this.#req.session?.users?.id){
            this.#req.session.destroy();
            this.#res.redirect('/');
        }
    }

    /* Function to visit and load the wallpage */
    wallpage = async () => {

        let messagesModel = new MessagesModel();
        let { result: [{messages_data}] } = await messagesModel.fetchMessagesAndComments();

        this.#res.render('layouts/wallpage', { first_name: this.#req.session?.users?.first_name, messages_data: JSON.parse(messages_data || '[]') });
    }

    /* Function to post a message */
    postMessage = async () => {
        let response_data = { status: false, result: {}, error: null }

        try{
            let validate_fields = validateFields(this.#req.body, ["content"]);

            if(validate_fields.status){
                let { content } = validate_fields.result.sanitized_fields;

                let messagesModel = new MessagesModel();
                response_data = await messagesModel.postMessage({ user_id: this.#req.session.users.id, content });
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to post a message";
        }

        this.#res.json(response_data);
    }

    /* Function to post a comment */
    postComment = async () => {
        let response_data = { status: false, result: {}, error: null }

        try{
            let validate_fields = validateFields({ ...this.#req.body, ...this.#req.params }, ["message_id", "content"]);

            if(validate_fields.status){
                let { message_id, content } = validate_fields.result.sanitized_fields;

                let commentsModel = new CommentsModel();
                response_data = await commentsModel.postComment({ user_id: this.#req.session.users.id, message_id, content }, this.#req.session.users.name);
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to post a comment";
        }

        this.#res.json(response_data);
    }

    /* Function to delete a message */
    deleteMessage = async () => {
        let response_data = { status: false, result: {}, error: null }

        try{
            let validate_fields = validateFields(this.#req.params , ["message_id"]);

            if(validate_fields.status){
                let { message_id } = validate_fields.result.sanitized_fields;

                let messagesModel = new MessagesModel();
                response_data = await messagesModel.deleteMessage({ message_id, user_id: this.#req.session.users.id });
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to delete a message";
        }

        this.#res.json(response_data);
    }

    /* Function to delete a comment */
    deleteComment = async () => {
        let response_data = { status: false, result: {}, error: null }

        try{
            let validate_fields = validateFields(this.#req.params , ["comment_id"]);

            if(validate_fields.status){
                let { comment_id } = validate_fields.result.sanitized_fields;

                let commentsModel = new CommentsModel();
                response_data = await commentsModel.deleteComment({ comment_id, user_id: this.#req.session.users.id });
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to delete a comment";
        }

        this.#res.json(response_data);
    }
}

module.exports = WallController;