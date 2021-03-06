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

import com.google.sps.data.BusinessMap;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Scanner;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Returns business location data as a JSON array, e.g. [{"lat": 38.4404675, "lng": -122.7144313}] */
@WebServlet("/business-map-data")
public class BusinessMapServlet extends HttpServlet {

  private Collection<BusinessMap> businesses;

  public void getBusiness(HttpServletRequest request) {
    businesses = new ArrayList<>();
    String businessName = request.getParameter("marker");
    Scanner scanner = new Scanner(getServletContext().getResourceAsStream("/WEB-INF/" + businessName + "-data.csv"));
    while (scanner.hasNextLine()) {
      String line = scanner.nextLine();
      String[] cells = line.split(",");
      String name = cells[0];
      String website = cells[1];
      double lat = Double.parseDouble(cells[2]);
      double lng = Double.parseDouble(cells[3]);
       
      businesses.add(new BusinessMap(name, website, lat, lng));
    }
    scanner.close();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    Gson gson = new Gson();
    getBusiness(request);
    String json = gson.toJson(businesses);
    response.getWriter().println(json);
  }
}