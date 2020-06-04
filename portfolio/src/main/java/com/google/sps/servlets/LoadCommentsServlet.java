// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import com.google.sps.data.Comments;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.data.Comments;
import java.util.Iterator;

/** Servlet responsible for listing comments. */
@WebServlet("/load-comments")
public class LoadCommentsServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    List<Comments> comments = getCommentList(request);
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(comments));
  }
  
  /**
   * Determines the order in which the comments are displayed.
   */
  private Query getCommentOrder(HttpServletRequest request) {
    String commentOrder = request.getParameter("order");;
    Query query;
    if (commentOrder.equals("ascend")) {
      query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    } else {
      query = new Query("Comment").addSort("timestamp", SortDirection.ASCENDING);  
    }
    return query;
  }

  /**
   * Retrieves and stores comment information in a List.
   */
  private List<Comments> getCommentList(HttpServletRequest request) {
    Query query = getCommentOrder(request);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
    List<Comments> comments = new ArrayList<>();

    Iterator<Entity> commentIterator = results.asIterable().iterator();
    int commentLimit = Integer.parseInt(request.getParameter("max"));
  
    int totalComments = 0;
    while (commentIterator.hasNext() && totalComments < commentLimit) {
      Entity entity = commentIterator.next();
      String userName = (String) entity.getProperty("name");
      String userComment = (String) entity.getProperty("comment");
      long timestamp = (long) entity.getProperty("timestamp");
      long id = entity.getKey().getId();
        
      Comments newComment = new Comments(userName, userComment, timestamp, id);
      comments.add(newComment);
      totalComments++;
    }

    return comments;
  }
}
