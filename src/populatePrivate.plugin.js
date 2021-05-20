/* eslint-disable no-param-reassign */

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, updatedAt, and any path that has private: true
 *  - replaces _id with id
 *  - creates and populates virtuals for each schemaType instance of ObjectID 
 *    that has a ref to a Modal, and schemaType options: 'privateRef: true, private:true'
 *  - populates for '1 to 1' with the ObjectID of the related document. 
 *  - populates '1 to many' with an Array of ObjectIDs from the relating documents.
 */

/**
* @property {Object} schema.path
* @property {ObjectId} type - ObjectId of related document
* @property {string} ref - Name of Model to use for population"
* @property {boolean} privateRef - if TRUE, this 
* @property {boolean} private - true
* @property {boolean} required - Optional
* 
*/

const deleteAtPath = (obj, path, index) => {
    if (index === path.length - 1) {
        delete obj[path[index]];
        return;
    }
    deleteAtPath(obj[path[index]], path, index + 1);
};


const populatePrivate = (schema) => {

    schema.set("toJSON", { virtuals: true });

    let transform;
    if (schema.options.toJSON && schema.options.toJSON.transform) {
        transform = schema.options.toJSON.transform;
    }

    schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
        transform(doc, ret, options) {
            Object.keys(schema.paths).forEach((path) => {
                /**
                 *  Remove ObjectID Ref paths for '1 to 1' populations
                */
                if (schema.paths[path].options && schema.paths[path].options.private) {
                    deleteAtPath(ret, path.split('.'), 0);
                }
                /**
                 *  Remove ObjectID Ref Array paths for '1 to many' populations
                */
                if (schema.paths[path].caster && schema.paths[path].caster.options && schema.paths[path].caster.options.private) {
                    deleteAtPath(ret, path.split('.'), 0);
                }
            });
            /**
             *  Remove '_id', '__v', 'updatedAt' from JSON
            */

            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            if (transform) {
                return transform(doc, ret, options);
            }
        },
    });


    schema.eachPath((pathname, schematype) => {
        // 1 to 1 Relationship
        if (schematype.options.hasOwnProperty("privateRef")) {
            schema.virtual(pathname.replace("_", "").trim(), {
                ref: schematype.options.ref,
                localField: pathname,
                foreignField: '_id',
                justOne: true,
            });
        }
        // 1 to Many Relationship
        if (schematype.hasOwnProperty("caster") && schematype.caster.options.hasOwnProperty("privateRef")) {
            schema.virtual(pathname.replace("_", "").trim(), {
                ref: schematype.caster.options.ref,
                localField: pathname,
                foreignField: '_id',
                justOne: false,
            });
        }
    });

    schema.pre('find', function () {
        Object.keys(schema.virtuals).map(path => {
            schema.virtuals[path].options.hasOwnProperty("ref")
                && this.populate({ path: schema.virtuals[path].path, select: " -createdAt -updatedAt -__v" });
        });
    });

    schema.statics.dev = function () {
        return schema
    };
}

module.exports = populatePrivate;