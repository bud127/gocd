/*
 * Copyright 2018 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.thoughtworks.go.server.newsecurity.filters;

import com.thoughtworks.go.http.mocks.MockHttpServletRequest;
import com.thoughtworks.go.http.mocks.MockHttpServletResponse;
import com.thoughtworks.go.http.mocks.MockHttpServletResponseAssert;
import com.thoughtworks.go.server.newsecurity.utils.SessionUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;


class UserEnabledCheckFilterWithRedirectToLoginPageTest {

    private UserEnabledCheckFilterWithRedirectToLoginPage filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        filter = new UserEnabledCheckFilterWithRedirectToLoginPage(null, null);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
    }

    @Test
    void shouldRedirectToLoginPageWithAnErrorMessageInTheSession() throws IOException {
        filter.handleFailure(request, response, "something bad happened!");

        MockHttpServletResponseAssert.assertThat(response).redirectsTo("/go/auth/login");
        assertThat(SessionUtils.getAuthenticationError(request)).isEqualTo("something bad happened!");
    }
}
