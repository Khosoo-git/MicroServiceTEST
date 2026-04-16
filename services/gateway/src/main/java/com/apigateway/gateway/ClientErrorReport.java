package com.apigateway.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

/**
 * Browser-reported error payload (any customer site can POST this via the embed snippet).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClientErrorReport {

	private String message;
	private String stack;
	/** Full page URL where the error occurred (location in the site). */
	private String url;
	private Integer line;
	private Integer column;
	private String userAgent;
	/** Optional tenant / site identifier from the embed config. */
	private String siteKey;
	private String componentStack;
	private Map<String, Object> extra;

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getStack() {
		return stack;
	}

	public void setStack(String stack) {
		this.stack = stack;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public Integer getLine() {
		return line;
	}

	public void setLine(Integer line) {
		this.line = line;
	}

	public Integer getColumn() {
		return column;
	}

	public void setColumn(Integer column) {
		this.column = column;
	}

	public String getUserAgent() {
		return userAgent;
	}

	public void setUserAgent(String userAgent) {
		this.userAgent = userAgent;
	}

	public String getSiteKey() {
		return siteKey;
	}

	public void setSiteKey(String siteKey) {
		this.siteKey = siteKey;
	}

	public String getComponentStack() {
		return componentStack;
	}

	public void setComponentStack(String componentStack) {
		this.componentStack = componentStack;
	}

	public Map<String, Object> getExtra() {
		return extra;
	}

	public void setExtra(Map<String, Object> extra) {
		this.extra = extra;
	}
}
