/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Thunderbird Global Database.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Andrew Sutherland <asutherland@asutherland.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

EXPORTED_SYMBOLS = ["GlodaQueryClassFactory"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gloda/modules/log4moz.js");

/**
 * @class Query class core; each noun gets its own sub-class where attributes
 *  have helper methods bound.
 * 
 * @property _owner The query instance that holds the list of unions...
 * @property _constraints A list of (lists of OR constraints) that are ANDed
 *     together.  For example [[FROM bob, FROM jim], [DATE last week]] would
 *     be requesting us to find all the messages from either bob or jim, and
 *     sent in the last week.
 * @property _unions A list of other queries whose results are unioned with our
 *     own.  There is no concept of nesting or sub-queries apart from this
 *     mechanism.
 */
function GlodaQueryClass() {
  // if we are an 'or' clause, who is our parent whom other 'or' clauses should
  //  spawn from...
  this._owner = null;
  // our personal chain of and-ing.
  this._constraints = [];
  // the other instances we union with
  this._unions = [];
  
  this._order = [];
  this._limit = 0;
}

GlodaQueryClass.prototype = {
  WILDCARD: {},
  
  get constraintCount() {
    return this._constraints.length;
  },
  
  or: function gloda_query_or() {
    let owner = this._owner || this;
    let orQuery = new this._queryClass();
    orQuery._owner = owner;
    owner._unions.push(orQuery);
    return orQuery;
  },
  
  orderBy: function gloda_query_orderBy() {
    for (let iArg = 0; iArg < arguments.length; iArg++) {
      let arg = arguments[iArg];
      this._order.push(arg);
    }
  },
  
  limit: function gloda_query_limit(aLimit) {
    this._limit = aLimit;
  },
  
  /**
   * Return a collection asynchronously populated by this collection.  You must
   *  provide a listener to receive notifications from the collection as it
   *  receives updates.  The listener object should implement onItemsAdded,
   *  onItemsModified, and onItemsRemoved methods, all of which take a single
   *  argument which is the list of items which have been added, modified, or
   *  removed respectively.
   */
  getCollection: function gloda_query_getCollection(aListener, aData) {
    return this._nounMeta.datastore.queryFromQuery(this, aListener, false,
      aData);
  },
  
  getAllSync: function gloda_query_getAllSync(aListener) {
    return this._nounMeta.datastore.queryFromQuery(this, aListener, true);
  },
  
  /**
   * Test whether the given first-class noun instance satisfies this query.
   * 
   */
  test: function gloda_query_test(aObj) {
    // when changing this method, be sure that GlodaDatastore's queryFromQuery
    //  method likewise has any required changes made. 
    let unionQueries = [this].concat(this._unions);
    
    for (let iUnion = 0; iUnion < unionQueries.length; iUnion++) {
      let curQuery = unionQueries[iUnion];

      // assume success until a specific (or) constraint proves us wrong
      let querySatisfied = true;
      for (let iConstraint = 0; iConstraint < curQuery._constraints.length; 
           iConstraint++) {
        let attr_ors = curQuery._constraints[iConstraint];
        
        // the attribute is the same for a given constraint, so we can pull it
        //  out here.
        let attribDef = attr_ors[0][0];
        let attribVal = attribDef.getValueFromInstance(aObj);
        
        if (attribDef.singular) {
          // assume failure unless we find an or that matches...
          let orSatisfied = false;
          for (let iOrIndex = 0; iOrIndex < attr_ors.length; iOrIndex++) {
            let APV = attr_ors[iOrIndex];
            
            // straight value match
            if (APV.length == 3) {
              if (APV[2] == attribVal) {
                orSatisfied = true;
                break;
              }
            }
            else { // APV.length == 4, range match
              if ((APV[2] <= attribVal) && (attribVal <= APV[3])) {
                orSatisfied = true;
                break;
              } 
            }
          }
          if (!orSatisfied) { 
            querySatisfied = false;
            break;
          }
        }
        else { // not singular
          // assume failure unless we find an or that matches...
          let orSatisfied = false;
          for (let iOrIndex = 0; iOrIndex < attr_ors.length; iOrIndex++) {
            let APV = attr_ors[iOrIndex];
            
            // see if the value is present in any of the values on the object
            if (APV.length == 3) {
              if (attribVal.indexOf(APV[2]) != -1) {
                orSatisfied = true;
                break;
              }
            }
            else { // APV.length == 4
              // see if any of the values are in any of the ranges
              for (let iVal = 0; iVal < attribVal.length; iVal++) {
                let curVal = attribVal[iVal];
                if ((APV[2] <= curVal) && (curVal <= APV[3])) {
                  orSatisfied = true;
                  break;
                }
              }
              if (orSatisfied)
                break;
            }
          }
          if (!orSatisfied) { 
            querySatisfied = false;
            break;
          }
        }
      }
      
      if (querySatisfied)
        return true;
    }
    
    return false;
  },
};

/**
 * @class A query that only 'tests' for already belonging to the collection.
 */
function GlodaExplicitQueryClass() {
}

GlodaExplicitQueryClass.prototype = {
  // don't let people try and mess with us
  or: function() { return null; },
  // don't let people try and query on us (until we have a real use case for
  //  that...)
  getAllSync: function() { return null; },
  /**
   * Matches only items that are already in the collection (by id).
   */
  test: function gloda_query_explicit_test(aObj) {
    return (aObj.id in this.collection._idMap);
  }
};

/**
 * @class A query that 'tests' true for everything.  Intended for debugging purposes
 *  only.
 */
function GlodaWildcardQueryClass() {
}

GlodaWildcardQueryClass.prototype = {
  // don't let people try and mess with us
  or: function() { return null; },
  // don't let people try and query on us (until we have a real use case for
  //  that...)
  getAllSync: function() { return null; },
  /**
   * Everybody wins!
   */
  test: function gloda_query_explicit_test(aObj) {
    return true;
  }
};

/**
 * Factory method to effectively create per-noun subclasses of GlodaQueryClass,
 *  GlodaExplicitQueryClas, and GlodaWildcardQueryClass.  For GlodaQueryClass
 *  this allows us to add per-noun helpers.  For the others, this is merely a
 *  means of allowing us to attach the (per-noun) nounMeta to the 'class'.
 */
function GlodaQueryClassFactory(aNounMeta) {
  let newQueryClass = function() {
    GlodaQueryClass.call(this);
  }; 
  
  newQueryClass.prototype = new GlodaQueryClass;
  newQueryClass.prototype._queryClass = newQueryClass;
  newQueryClass.prototype._nounMeta = aNounMeta;
  
  let newExplicitClass = function(aCollection) {
    GlodaExplicitQueryClass.call(this);
    this.collection = aCollection;
  };
  newExplicitClass.prototype = new GlodaExplicitQueryClass();
  newExplicitClass.prototype._queryClass = newExplicitClass;
  newExplicitClass.prototype._nounMeta = aNounMeta;

  let newWildcardClass = function(aCollection) {
    GlodaWildcardQueryClass.call(this);
    this.collection = aCollection;
  };
  newWildcardClass.prototype = new GlodaWildcardQueryClass();
  newWildcardClass.prototype._queryClass = newWildcardClass;
  newWildcardClass.prototype._nounMeta = aNounMeta;
  
  return [newQueryClass, newExplicitClass, newWildcardClass];
}
